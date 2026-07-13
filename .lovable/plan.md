## Objetivo

Adicionar três recursos à aplicação atual (HTML + jQuery + Tailwind CDN):

1. **Dark mode** com alternância manual e persistência.
2. **Página "Biblioteca"** com todos os casos agrupados por categoria em lista de duas colunas, e página de detalhe do caso.
3. **Seletor de idioma** (pt-BR / EN, extensível a outros) trocando entre `database-pt-br.json` e `database-en.json`.

## Estrutura de arquivos

Sem framework — continuamos multi-página estática:

```text
index.html            → tela de treino (quiz), como já existe
biblioteca.html       → nova: lista de todos os casos por categoria
caso.html             → nova: detalhe de um caso (via ?id=)
public/js/
  data.js             → estendido: suporta múltiplos idiomas
  case.js             → reutilizado no detalhe
  quiz.js             → inalterado
  app.js              → treino (index)
  library.js          → nova: renderiza biblioteca
  detail.js           → nova: renderiza caso individual
  i18n.js             → nova: gerencia idioma + textos da UI
  theme.js            → nova: gerencia dark mode
public/styles.css     → ajustes para dark
```

## 1. Dark mode

- Botão "🌙 / ☀️" no header de todas as páginas.
- `theme.js` aplica classe `dark` em `<html>` e salva em `localStorage` (`ecg-theme`).
- Habilitar `darkMode: 'class'` via config inline do Tailwind CDN:
  ```html
  <script>tailwind.config = { darkMode: 'class' }</script>
  ```
- Adicionar variantes `dark:` nos containers principais (bg, texto, bordas, cards, modal de zoom, badges).
- `styles.css`: fundo do grid do ECG mantém-se claro (a imagem exige fundo branco), então envolvemos a imagem em wrapper branco mesmo no dark.

## 2. Biblioteca de casos (`biblioteca.html` + `caso.html`)

**biblioteca.html**
- Header compartilhado (título, seletor idioma, toggle dark, link "Treinar" ↔ "Biblioteca").
- Campo de busca (filtra por diagnóstico/caso clínico).
- Filtro de categoria (mesmas opções do quiz).
- Renderiza por categoria: `<h2>` da categoria + grid `grid-cols-1 sm:grid-cols-2` com cards clicáveis (diagnóstico + trecho do caso). Cada card link para `caso.html?id={id}`.
- Estado vazio + contadores por categoria.

**caso.html**
- Recebe `?id=`.
- Reusa `ECG_CASE.render()` e o modal de zoom já existentes; gabarito revelado por padrão (não é modo quiz).
- Botão "← Voltar à biblioteca" e "Treinar este tipo" (leva ao quiz com categoria pré-selecionada via `?categoria=`).
- `index.html` passa a ler `?categoria=` para pré-selecionar o filtro.

## 3. Seletor de idioma

- `<select id="idioma">` no header (todas as páginas): pt-BR, EN. Estrutura pronta para novos idiomas.
- `i18n.js`:
  - Lista de idiomas: `[{code:'pt-BR', label:'Português', file:'database-pt-br.json'}, {code:'en', label:'English', file:'database-en.json'}]`.
  - Textos fixos da UI (labels, botões, títulos) num dicionário por idioma; aplicados via `data-i18n="chave"`.
  - `getIdioma()` / `setIdioma()` persistem em `localStorage` (`ecg-lang`, padrão `pt-BR`).
- `data.js`:
  - `DB.carregar()` passa a receber o idioma e busca o JSON correspondente.
  - Trocar idioma dispara recarga do dataset e re-render (no quiz reinicia a lista; na biblioteca re-renderiza; no detalhe recarrega o caso pelo mesmo `id`).
- Se um `id` não existir no idioma alvo (datasets diferentes), exibe aviso e volta à biblioteca.

## Persistência (localStorage)

- `ecg-quiz-progress` (já existe) — inalterado.
- `ecg-theme`: `'dark' | 'light'`.
- `ecg-lang`: `'pt-BR' | 'en' | ...`.

## Escopo — o que NÃO muda

- Lógica do quiz, contadores, scraper, e conteúdo dos JSONs.
- Nenhum backend novo; tudo client-side estático.

## Entregáveis

- `index.html` (header atualizado: toggle dark + seletor idioma + link biblioteca; i18n nos textos).
- `biblioteca.html`, `caso.html` novos.
- `public/js/theme.js`, `i18n.js`, `library.js`, `detail.js` novos.
- `public/js/data.js`, `app.js`, `case.js` ajustados para idioma/dark.
- `public/styles.css` com regras dark.
