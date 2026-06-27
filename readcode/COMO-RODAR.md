# ReadCode — Como Rodar

## Pré-requisitos
- Node.js 18+ instalado

## Passos

### 1. Acesse a pasta do projeto

**Windows (PowerShell):**
```
cd C:\Users\jeffe\Claude\Projects\ReadCode\readcode
```

**WSL / Ubuntu:**
```bash
cd /mnt/c/Users/jeffe/Claude/Projects/ReadCode/readcode
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 4. Abra no navegador
```
http://localhost:3000
```

---

## Configurar o LLM

Na interface, clique em **"Configurar LLM"** no canto superior direito e:

- **Anthropic (Claude):** cole sua API key de https://console.anthropic.com/keys
- **OpenAI:** cole sua API key de https://platform.openai.com/api-keys
- **Groq (grátis):** cole sua API key de https://console.groq.com/keys
- **Ollama (100% local):** certifique-se que o Ollama está rodando localmente

---

## Como usar

1. **Arraste uma pasta** do seu projeto (ou um arquivo .zip, ou múltiplos arquivos)
2. A **árvore de arquivos** aparece à esquerda
3. Clique em qualquer arquivo para ver o código no centro
4. Clique em qualquer **linha de código** para selecioná-la
5. No **painel direito**, escolha a análise:
   - 🗺️ **Visão Geral** — resume o projeto inteiro
   - 📋 **Regras de Negócio** — extrai as regras em linguagem natural
   - 🧹 **Código Morto** — acha código não utilizado
   - 🧪 **Testes** — gera estratégia de testes com exemplos
   - 🎓 **Explicar** — explica linha por linha (ou o arquivo inteiro)
