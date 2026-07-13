// Scraper offline para gerar public/database.json
// Uso: node scripts/scrape-ecglibrary.mjs
//
// Estratégia: o ecglibrary.com serve HTML estático com estrutura consistente
// (<div class="jumbotron"> contém o caso clínico e a imagem; o primeiro
// <div class="col-md-4"> em seguida contém <h2> = diagnóstico + <ul>/<p> = interpretação).
// Como o site é estático, fetch direto é mais confiável (e mais barato) que
// passar por Firecrawl. FIRECRAWL_API_KEY fica disponível caso queiramos usar
// como fallback no futuro.

import fs from "node:fs/promises";
import path from "node:path";

const BASE = "http://www.ecglibrary.com/";
const HOME = BASE + "ecghome.php";

const OUT = path.join(process.cwd(), "public", "database.json");
const WARN = path.join(process.cwd(), "scrape-warnings.log");

// Traduções pt-BR das categorias
const CATEGORIA_PT = {
  "ischaemic heart disease": "Doença isquêmica do coração",
  "hypertrophy patterns": "Padrões de hipertrofia",
  "atrioventricular (av) block": "Bloqueio atrioventricular (AV)",
  "bundle branch block": "Bloqueios de ramo",
  "supraventricular rhythms": "Ritmos supraventriculares",
  "ventricular rhythms": "Ritmos ventriculares",
  "pacemakers": "Marca-passos",
  "wolff parkinson white syndrome": "Síndrome de Wolff-Parkinson-White",
  "miscellaneous": "Miscelânea",
  "other": "Outros",
};

const IGNORAR_URLS = new Set([
  "axis.html",
  "ecghist.html",
  "ecgsbyeg.html",
  "about.php",
  "about.html",
  "ecgfaq.html",
]);

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (ECG-Trainer educational scraper; contact: local)",
    },
  });
  if (!res.ok) throw new Error("HTTP " + res.status + " para " + url);
  return await res.text();
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Converte <li> em linhas com "- "
function bulletsFromHtml(html) {
  const lis = [...html.matchAll(/<li[^>]*>([\s\S]*?)(?:<\/li>|<li)/gi)].map((m) =>
    stripTags(m[1])
  );
  return lis.filter(Boolean).map((l) => "- " + l).join("\n");
}

function absUrl(src) {
  if (!src) return "";
  if (src.startsWith("//")) return "http:" + src;
  if (src.startsWith("http")) return src;
  return BASE + src.replace(/^\.?\/*/, "");
}

function parseHome(html) {
  // Extrai seções h3 -> categoria; links entre um h3 e o próximo
  const secoes = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|<footer|<\/body)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const catRaw = stripTags(m[1]).toLowerCase();
    const bloco = m[2];
    const linkRe = /<a\s+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const links = [];
    let lm;
    while ((lm = linkRe.exec(bloco)) !== null) {
      const href = lm[1].trim();
      if (IGNORAR_URLS.has(href)) continue;
      if (!/\.(php|html)$/i.test(href)) continue;
      links.push({ href, texto: stripTags(lm[2]) });
    }
    if (links.length > 0) {
      const cat = CATEGORIA_PT[catRaw] || catRaw;
      secoes.push({ categoria: cat, links });
    }
  }
  return secoes;
}

function parseCasePage(html) {
  // Caso clínico + imagem: dentro de <div class="jumbotron">
  const jumboMatch = html.match(
    /<div\s+class="jumbotron"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i
  );
  let caso_clinico = "";
  let imagem_ecg = "";
  if (jumboMatch) {
    const jb = jumboMatch[1];
    const h1 = jb.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) caso_clinico = stripTags(h1[1]);
    const img = jb.match(/<img[^>]*>/i);
    if (img) {
      const src = img[0].match(/\bsrc="([^"]+)"/i);
      const srcset = img[0].match(/\bsrcset="([^"]+)"/i);
      let best = src ? src[1] : "";
      if (srcset) {
        // pega a primeira variante (geralmente _2x maior)
        const parts = srcset[1].split(",").map((s) => s.trim().split(/\s+/)[0]);
        if (parts.length) best = parts[0];
      }
      imagem_ecg = absUrl(best);
    }
  }

  // Diagnóstico + interpretação: primeiro <div class="col-md-4"> após jumbotron
  // contendo um <h2>
  let diagnostico = "";
  let interpretacao = "";
  const colRe = /<div\s+class="col-md-\d+"[^>]*>([\s\S]*?)<\/div>/gi;
  let cm;
  while ((cm = colRe.exec(html)) !== null) {
    const col = cm[1];
    const h2 = col.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2) {
      diagnostico = stripTags(h2[1]);
      const rest = col.slice(col.indexOf("</h2>") + 5);
      const ul = rest.match(/<ul[\s\S]*?<\/ul>/i);
      const paras = [...rest.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
        stripTags(m[1])
      );
      const partes = [];
      if (ul) {
        const bl = bulletsFromHtml(ul[0]);
        if (bl) partes.push(bl);
      }
      paras.forEach((p) => {
        if (p) partes.push(p);
      });
      interpretacao = partes.join("\n").trim();
      break;
    }
  }

  return { caso_clinico, imagem_ecg, diagnostico, interpretacao };
}

async function main() {
  console.log("Baixando home:", HOME);
  const home = await fetchText(HOME);
  const secoes = parseHome(home);
  console.log("Categorias encontradas:", secoes.length);

  const vistos = new Set();
  const casos = [];
  const avisos = [];
  let id = 1;

  for (const sec of secoes) {
    for (const link of sec.links) {
      if (vistos.has(link.href)) continue;
      vistos.add(link.href);
      const url = BASE + link.href;
      try {
        console.log("  ->", sec.categoria, "|", link.href);
        const html = await fetchText(url);
        const p = parseCasePage(html);
        if (!p.caso_clinico || !p.imagem_ecg || !p.diagnostico) {
          avisos.push(
            "[incompleto] " +
              url +
              " | caso=" +
              !!p.caso_clinico +
              " img=" +
              !!p.imagem_ecg +
              " diag=" +
              !!p.diagnostico
          );
          continue;
        }
        casos.push({
          id: id++,
          categoria: sec.categoria,
          caso_clinico: p.caso_clinico,
          imagem_ecg: p.imagem_ecg,
          diagnostico: p.diagnostico,
          interpretacao: p.interpretacao,
          fonte: url,
        });
      } catch (e) {
        avisos.push("[erro] " + url + " -> " + e.message);
      }
      // gentileza com o servidor
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(casos, null, 2), "utf8");
  if (avisos.length) await fs.writeFile(WARN, avisos.join("\n"), "utf8");
  console.log("\n✓ " + casos.length + " casos gravados em " + OUT);
  if (avisos.length) console.log("⚠ " + avisos.length + " avisos em " + WARN);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
