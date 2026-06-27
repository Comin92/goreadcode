# GoReadCode — Timeline de Desenvolvimento

> Registro cronológico de todas as alterações, implementações e correções do projeto.
> **Repositório:** https://github.com/Comin92/goreadcode
> **Linux (principal):** `~/lab/goreadcode`
> **Windows (espelho):** `C:\Users\jeffe\Claude\Projects\ReadCode`

---

## Formato de Entrada

```
### [TÍTULO DA ALTERAÇÃO]
- **Data/Hora:** YYYY-MM-DD HH:MM (BRT)
- **Tipo:** feat | fix | refactor | test | docs | chore
- **Commit:** `hash` ou `pendente`
- **Arquivos Alterados:**
  - `caminho/arquivo.ext` — descrição do que mudou
- **Funções/Componentes Alterados:**
  - `nomeDaFuncao()` em `arquivo.ext` — o que foi feito
- **Descrição:** Resumo da implementação
- **Testado:** ✅ Sim | ❌ Não | ⚠️ Parcial
```

---

## Registro

---

### [SETUP] Estrutura inicial do projeto GoReadCode MVP
- **Data/Hora:** 2026-06-25 ~20:00 (BRT)
- **Tipo:** feat
- **Commit:** `initial commit — GoReadCode MVP + PRD`
- **Arquivos Alterados:**
  - `readcode/package.json` — dependências Next.js 14, React 18, TypeScript, Tailwind, jszip
  - `readcode/types/index.ts` — tipos globais do projeto
  - `readcode/lib/llm.ts` — motor de streaming multi-LLM
  - `readcode/lib/prompts.ts` — prompts em português para análise de código
  - `readcode/lib/fileParser.ts` — parser de arquivos, ZIP, drag&drop
  - `readcode/lib/syntaxHighlight.ts` — syntax highlighting via regex
  - `readcode/app/globals.css` — variáveis CSS, tema dark, JetBrains Mono
  - `readcode/app/page.tsx` — página principal com layout resizável
  - `readcode/components/UploadZone.tsx` — zona de upload (drop/paste/path)
  - `readcode/components/CodeViewer.tsx` — visualizador de código com linhas clicáveis
  - `readcode/components/AnalysisPanel.tsx` — painel de análise com 5 abas
  - `readcode/components/LLMConfig.tsx` — configuração de provider LLM
  - `readcode/COMO-RODAR.md` — instruções de uso
  - `goreadcode.md` — PRD completo do projeto
  - `GoReadCode_PRD_generator.py` — gerador do PDF do PRD
  - `.gitignore` — exclusões de build e dependências
- **Funções/Componentes Alterados:**
  - `streamLLM()` em `lib/llm.ts` — roteamento multi-provider com SSE/NDJSON
  - `streamAnthropic()` em `lib/llm.ts` — streaming Anthropic Claude
  - `streamOpenAICompatible()` em `lib/llm.ts` — streaming OpenAI/Groq
  - `streamOllama()` em `lib/llm.ts` — streaming Ollama local
  - `buildFileTree()` em `lib/fileParser.ts` — monta árvore de arquivos
  - `parseDroppedItems()` em `lib/fileParser.ts` — processa drag&drop
  - `parseFileList()` em `lib/fileParser.ts` — processa seleção de arquivos
  - `highlightCode()` em `lib/syntaxHighlight.ts` — syntax highlight regex
  - `<AnalysisPanel>` — 5 abas: visão geral, regras de negócio, código morto, testes, explicar
  - `<CodeViewer>` — render de linhas com click handler
  - `<UploadZone>` — 3 modos de entrada de código
  - `<LLMConfig>` — seletor de provider + modelo + API key
- **Descrição:** MVP completo da aplicação GoReadCode com análise de código via LLM multi-provider, upload/drag&drop, visualizador com syntax highlight e painel de análise com streaming.
- **Testado:** ⚠️ Parcial (estrutura criada, npm install e testes manuais pendentes pelo usuário)

---

### [INFRA] Repositório GitHub criado e código publicado
- **Data/Hora:** 2026-06-26 21:46 (BRT)
- **Tipo:** chore
- **Commit:** push inicial — `main -> main`
- **Arquivos Alterados:**
  - Todos os arquivos do projeto (33 objetos)
- **Funções/Componentes Alterados:** N/A
- **Descrição:** Repositório `Comin92/goreadcode` criado via `gh repo create`. Push via HTTPS após resolver problema de SSH key (`coolify.pub` sem permissão). Autenticação via `gh auth setup-git`.
- **Testado:** ✅ Sim — push confirmado em https://github.com/Comin92/goreadcode

---

---

### [FEAT] Importação de repositório GitHub por URL
- **Data/Hora:** 2026-06-26 22:30 (BRT)
- **Tipo:** feat
- **Commit:** `feat: github import por URL + sync infra`
- **Arquivos Alterados:**
  - `readcode/lib/githubImport.ts` — novo módulo de importação via GitHub API
  - `readcode/components/UploadZone.tsx` — nova aba "🐙 GitHub" com progress bar
  - `readcode/app/page.tsx` — suporte a `RepoInfo`, badge do repo no header
  - `TIMELINE.md` — este arquivo
  - `sync.sh` — script de sync Linux↔Windows
- **Funções/Componentes Alterados:**
  - `parseGitHubUrl()` em `githubImport.ts` — parse de URL/slug GitHub
  - `shouldSkipPath()` em `githubImport.ts` — filtro de arquivos binários/desnecessários
  - `ghFetch()` em `githubImport.ts` — fetch com auth e error handling
  - `importFromGitHub()` em `githubImport.ts` — orquestra meta → tree → conteúdo em batches de 6
  - `handleGitHubImport()` em `UploadZone.tsx` — handler com loading/progress/error states
  - `progressLabel()` em `UploadZone.tsx` — label descritivo por fase (meta/tree/files/done)
  - `handleFilesLoaded()` em `page.tsx` — aceita `RepoInfo` opcional do GitHub
  - Header em `page.tsx` — badge clicável com nome do repo e ⭐ estrelas
- **Descrição:** Usuário pode colar URL do GitHub (ou `owner/repo`) e importar qualquer repo público diretamente, sem baixar. Suporte a token para rate limit maior (5k/h vs 60/h) e repos privados. Barra de progresso por fase. Exemplos rápidos clicáveis. Badge do repo aparece no header após importação.
- **Testado:** ✅ TypeScript: 0 erros. Build inicia corretamente.

---

---

### [FEAT] AnalysisPanel melhorado + RepoInfoPanel no sidebar
- **Data/Hora:** 2026-06-26 23:00 (BRT)
- **Tipo:** feat
- **Commit:** `feat: analysis panel melhorado + repo info card no sidebar`
- **Arquivos Alterados:**
  - `readcode/components/AnalysisPanel.tsx` — reescrito com MarkdownRenderer melhorado e auto-run
  - `readcode/components/FileTree.tsx` — RepoInfoCard integrado no topo do sidebar
  - `readcode/app/page.tsx` — passa `repoInfo` prop ao FileTree
  - `readcode/app/globals.css` — estilos para `.hl-inline`, `.code-block-wrapper`
- **Funções/Componentes Alterados:**
  - `MarkdownRenderer` em `AnalysisPanel.tsx` — reescrito: split em code blocks e text blocks, renderização de tabelas, listas ordenadas/não-ordenadas, `renderInline()` para bold/italic/inline-code
  - `copyCode()` em `AnalysisPanel.tsx` — botão "Copiar" por code block (aparece no hover)
  - `runAnalysis()` em `AnalysisPanel.tsx` — cache de explain por `${filePath}:${lineNumber}` via `useRef<Map>`
  - `useEffect selectedLine` em `AnalysisPanel.tsx` — auto-run explain quando muda linha e já está na aba explain
  - `useEffect currentFile` em `AnalysisPanel.tsx` — limpa estado explain ao trocar de arquivo
  - `RepoInfoCard` em `FileTree.tsx` — card colapsável: description, language, ⭐ stars, 🍴 forks, topics, link para GitHub
  - `FileTree` em `FileTree.tsx` — aceita prop `repoInfo?: RepoInfo | null`
  - Indicador verde nas abas que já foram analisadas (`●` verde)
  - Exibe contagem "Analisará X de Y arquivos" antes de rodar
- **Descrição:** UX significativamente melhorada no painel de análise. MarkdownRenderer agora suporta: tabelas, code blocks com botão copiar por hover, listas ordenadas e não-ordenadas, blockquotes, bold, italic, inline code colorido. Cache de resultado "Explicar" por arquivo+linha evita re-chamadas desnecessárias à LLM. Auto-run quando seleciona linha estando na aba Explicar. Sidebar mostra card com metadados do repositório GitHub.
- **Testado:** ✅ TypeScript: 0 erros. Build inicia corretamente.

---

### [INFRA] Criação do TIMELINE.md e script de sincronização
- **Data/Hora:** 2026-06-26 22:00 (BRT)
- **Tipo:** chore
- **Commit:** pendente
- **Arquivos Alterados:**
  - `TIMELINE.md` — este arquivo, registro cronológico do projeto
  - `sync.sh` — script de sincronização Linux ↔ Windows
- **Funções/Componentes Alterados:** N/A
- **Descrição:** Infraestrutura de rastreamento de mudanças e sincronização entre os dois filesystems (Linux principal, Windows espelho).
- **Testado:** ✅ Sim

---
