# GoReadCode — Timeline de Desenvolvimento

> Registro cronológico de todas as alterações, implementações e correções do projeto.
> **Repositório:** https://github.com/Comin92/goreadcode
> **Linux (principal):** `~/lab/goreadcode`
> **Windows (espelho):** `C:\Users\jeffe\Claude\Projects\ReadCode`

---

## ⚠️ Comando de Sync Correto (sempre usar este)

```bash
# Windows → Linux (nunca omitir --exclude='.git/')
rsync -av --delete \
  --exclude='node_modules/' --exclude='.next/' --exclude='.git/' \
  --exclude='__pycache__/' --exclude='*.pyc' \
  /mnt/c/Users/jeffe/Claude/Projects/ReadCode/ ~/lab/goreadcode/
```

Ou simplesmente use `./sync.sh push` dentro do WSL — ele já tem todos os excludes corretos.

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
- **Data/Hora:** 2026-06-26 22:30 (B
---

### [FEAT] Diagrama de arquitetura Mermaid via CDN
- **Data/Hora:** 2026-06-26 23:45 (BRT)
- **Tipo:** feat
- **Commit:** `feat: diagrama mermaid de arquitetura via CDN`
- **Arquivos Alterados:**
  - `readcode/components/MermaidDiagram.tsx` — novo componente com carregamento via CDN (sem npm install)
  - `readcode/components/AnalysisPanel.tsx` — adicionada aba "Diagrama" (6ª aba), integração com MermaidDiagram via dynamic import
  - `readcode/lib/prompts.ts` — corrigido truncamento + função promptDiagram() completa
  - `readcode/types/index.ts` — corrigido truncamento + tipo "diagram" em AnalysisTab
- **Funções/Componentes Alterados:**
  - `MermaidDiagram` — carrega mermaid.js via script CDN dinâmico, dark theme, zoom, download SVG, copiar source, link mermaid.live
  - `TABS` em `AnalysisPanel.tsx` — adicionado { id: "diagram", label: "Diagrama", icon: "🔀" }
  - `states` em `AnalysisPanel.tsx` — adicionada chave "diagram" no estado inicial
  - `prompts` map em `runAnalysis()` — adicionado case "diagram" chamando promptDiagram()
  - `promptDiagram()` em `prompts.ts` — prompt para gerar flowchart TD com subgraphs por camada
- **Descrição:** Aba "🔀 Diagrama" gera diagrama de arquitetura Mermaid do projeto via LLM. Mermaid renderiza via CDN (sem necessidade de npm install). Durante streaming mostra preview do código raw; após concluído renderiza o SVG interativo com zoom, download e link para editor online.
- **Testado:** ✅ TypeScript: 0 erros.

---

### [FEAT] Chamadas LLM movidas para API route server-side
- **Data/Hora:** 2026-06-26 23:55 (BRT)
- **Tipo:** feat
- **Commit:** `feat: LLM streaming via API route server-side`
- **Arquivos Alterados:**
  - `readcode/app/api/stream/route.ts` — novo endpoint unificado para streaming LLM
  - `readcode/lib/llm.ts` — refatorado: agora chama /api/stream em vez de APIs externas diretamente
- **Funções/Componentes Alterados:**
  - `POST /api/stream` em `route.ts` — recebe provider/model/apiKey/prompts, faz chamada server-side, retorna SSE
  - `streamAnthropic()` em `route.ts` — lógica Anthropic movida para server
  - `streamOpenAICompatible()` em `route.ts` — lógica OpenAI/Groq movida para server
  - `streamOllama()` em `route.ts` — lógica Ollama movida para server
  - `streamLLM()` em `lib/llm.ts` — agora faz POST /api/stream e processa SSE de volta
- **Descrição:** As chamadas diretas do browser para Anthropic/OpenAI/Groq/Ollama foram movidas para uma API route Next.js server-side. O browser agora só se comunica com /api/stream (mesma origem), eliminando exposição de API keys em network requests externos visíveis no DevTools.
- **Testado:** ✅ TypeScript: 0 erros.

---

### [INFRA] Scripts de auto-início de sessão
- **Data/Hora:** 2026-06-27 00:10 (BRT)
- **Tipo:** chore
- **Commit:** `chore: start.sh + bashrc-snippet para auto-inicio de sessao`
- **Arquivos Alterados:**
  - `start.sh` — script completo de inicialização (sync + git + npm install + tsc + dev server)
  - `bashrc-snippet.sh` — atalhos de shell: gostart, gosync, gopush, gocd
- **Funções/Componentes Alterados:** N/A
- **Descrição:** `start.sh` automatiza toda a inicialização de sessão. `bashrc-snippet.sh` fornece atalhos no shell. Usuário adiciona uma linha ao ~/.bashrc e depois só roda `gostart` no WSL.
- **Testado:** ✅ Scripts criados com permissão de execução

---

### [FEAT] Chat interativo multi-turn sobre o código
- **Data/Hora:** 2026-06-27 00:30 (BRT)
- **Tipo:** feat
- **Commit:** `feat: chat interativo multi-turn sobre o código`
- **Arquivos Alterados:**
  - `readcode/types/index.ts` — adicionado `"chat"` em AnalysisTab + interface `ChatMessage`
  - `readcode/lib/llm.ts` — adicionada `streamChat()` para multi-turn; refatorado `_stream()` interno
  - `readcode/app/api/stream/route.ts` — suporte a `messages[]` multi-turn (além de userPrompt one-shot)
  - `readcode/components/AnalysisPanel.tsx` — aba "💬 Chat" com UI completa de conversa
- **Funções/Componentes Alterados:**
  - `ChatMessage` interface em `types/index.ts` — id, role, content, timestamp
  - `streamChat()` em `lib/llm.ts` — envia histórico de mensagens para /api/stream
  - `POST /api/stream` — aceita `messages[]` para conversas multi-turn
  - `ChatTab` component em `AnalysisPanel.tsx` — UI de chat: mensagens, suggestions, input com auto-resize, streaming em tempo real
  - `buildSystemPrompt()` — injeta até 15 arquivos do projeto como contexto da conversa
- **Descrição:** Aba "💬 Chat" permite conversa livre sobre o projeto carregado. Sistema injeta os arquivos como contexto, mantém histórico multi-turn, mostra sugestões de perguntas iniciais, streaming em tempo real. Enter envia, Shift+Enter nova linha.
- **Testado:** ✅ TypeScript: 0 erros.
