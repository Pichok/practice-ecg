## Objetivo

Recomeçar o projeto como uma aplicação estática (HTML + jQuery + Tailwind via CDN) para treinar leitura de ECGs, com dados extraídos automaticamente do ecglibrary.com via Firecrawl e persistência de progresso no `localStorage`.

## Etapas

### 1. Preparação
- Remover a estrutura React/TanStack existente (`src/`, `src/routes/`, `vite.config.ts`, `router.tsx` etc.) e substituir por uma app estática servida pelo Vite (apenas `index.html` + assets estáticos).
- Conectar o **Firecrawl** (`standard_connectors--connect`) para permitir o scraping.

### 2. Scraping (executado uma única vez em build-time via script Node)
- Criar `scripts/scrape-ecglibrary.mjs` que:
  1. Faz `map` de `http://www.ecglibrary.com/ecghome.php` para descobrir as páginas de categorias.
  2. Identifica as categorias principais: *Normal ECGs, Ischaemic heart disease, AV block, Bundle branch block, Atrial rhythms, Ventricular rhythms, Miscellaneous, Paediatric, Pacing*.
  3. Para cada página de caso, faz `scrape` (formatos `markdown` + `links` + `html`) e extrai:
     - `categoria`
     - `caso_clinico` (texto acima do ECG)
     - `imagem_ecg` (URL absoluta da imagem principal)
     - `diagnostico` (título/heading do caso)
     - `interpretacao` (texto descritivo abaixo do ECG)
  4. Grava `public/database.json` no formato pedido, com `id` sequencial.
- Rodar o script uma vez e commitar o `database.json` gerado (a app em runtime só lê o JSON estático, sem depender do Firecrawl).

### 3. Interface (HTML + jQuery + Tailwind CDN)
Arquivo único `index.html` + `app.js` + `styles.css` (mínimo).

Estrutura em português:
- **Cabeçalho**: título "Treinamento de ECG" + seletor `<select>` de categoria (opção "Todas").
- **Card do caso** (componente lógico em `app.js`):
  - Caso clínico em destaque.
  - Imagem do ECG clicável → abre modal em tela cheia com zoom (usando transform scale + arrastar, sem libs).
- **Área de gabarito** (oculta inicialmente):
  - Botão **"Ver Diagnóstico"** → revela `diagnostico` e `interpretacao` com fade.
  - Após revelar: botões **"Acertei"** (verde) e **"Errei"** (vermelho).
- **Painel de estatísticas**:
  - Contadores em tempo real: Acertos / Erros / Taxa de acerto (%).
  - Barra de progresso "Questão X de N" + botão **"Próximo ECG"**.
  - Botão **"Reiniciar progresso"** que limpa o `localStorage`.

### 4. Módulos JS (jQuery)
- `data.js` — `carregarDatabase()`: `$.getJSON('database.json')`, aplica filtro por categoria, embaralha.
- `case.js` — `renderCaso(caso)`: preenche DOM, esconde gabarito, liga modal de zoom.
- `quiz.js` — gerencia estado (índice atual, acertos, erros), atualiza contadores/barra, persiste em `localStorage` (`ecg-quiz-progress`).
- `app.js` — bootstrap: `$(function(){ ... })` amarra tudo.

### 5. Estilo
- Tailwind via `<script src="https://cdn.tailwindcss.com"></script>`.
- Layout responsivo (mobile-first), tipografia limpa, paleta clínica (branco/cinza/azul; verde e vermelho apenas nos botões de feedback).

### 6. Persistência
- Chave `ecg-quiz-progress` no `localStorage`:
  ```json
  { "acertos": 0, "erros": 0, "vistos": [1,2,3], "categoria": "todas" }
  ```
- Restaurado ao carregar; atualizado a cada clique em Acertei/Errei.

## Detalhes técnicos

- **Sem framework JS**: `index.html` estático, jQuery 3.x via CDN, Tailwind via CDN. Sem Vite/React/TanStack.
- **Firecrawl** é usado apenas offline no script de scraping; a chave nunca vai para o cliente.
- Caso o scraping não encontre algum campo, o script registra o item em `scrape-warnings.log` e pula (não polui o JSON).
- Modal de zoom: overlay `fixed inset-0`, imagem com `transform: scale()` controlado por roda do mouse e botões +/-, arrasto com `mousedown/mousemove`.

## Entregáveis
- `index.html`, `app.js`, `case.js`, `quiz.js`, `data.js`, `styles.css`
- `public/database.json` (gerado)
- `scripts/scrape-ecglibrary.mjs`
- Remoção da estrutura React existente.

Confirma para eu prosseguir?
