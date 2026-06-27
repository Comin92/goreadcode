# GoReadCode — Master Product Document

> **Understand Any Code. Anywhere.**
> Plataforma Inteligente de Compreensão, Engenharia Reversa e Inteligência de Software.

**Versão:** 1.0  
**Status:** Em Desenvolvimento Ativo  
**Tipo:** SaaS + Desktop (futuro) + Extensões IDE  
**Stack:** Next.js · NestJS · TypeScript · Python · PostgreSQL · Redis · LLMs

---

## Índice

1. [Visão e Missão](#1-visão-e-missão)
2. [Problema e Solução](#2-problema-e-solução)
3. [Público-Alvo e Personas](#3-público-alvo-e-personas)
4. [Diferenciais Competitivos](#4-diferenciais-competitivos)
5. [Onde Pode Ser Utilizado](#5-onde-pode-ser-utilizado)
6. [Fontes de Entrada Suportadas](#6-fontes-de-entrada-suportadas)
7. [Funcionalidades](#7-funcionalidades)
8. [Requisitos](#8-requisitos)
9. [Arquitetura de Software](#9-arquitetura-de-software)
10. [Inteligência Artificial](#10-inteligência-artificial)
11. [Visualização Inteligente](#11-visualização-inteligente)
12. [Stack Tecnológica](#12-stack-tecnológica)
13. [Banco de Dados](#13-banco-de-dados)
14. [APIs](#14-apis)
15. [UX / UI](#15-ux--ui)
16. [Segurança](#16-segurança)
17. [Roadmap](#17-roadmap)
18. [Métricas de Sucesso](#18-métricas-de-sucesso)
19. [Monetização](#19-monetização)
20. [Riscos](#20-riscos)
21. [Constituição do Produto](#21-constituição-do-produto)
22. [Glossário](#22-glossário)
23. [Status de Desenvolvimento](#23-status-de-desenvolvimento)

---

## 1. Visão e Missão

### Missão
Democratizar a compreensão de software complexo através de Inteligência Artificial, transformando qualquer código em conhecimento acessível.

### Visão
Ser a principal plataforma mundial de leitura inteligente de código-fonte, tornando qualquer projeto compreensível independentemente da linguagem, framework ou arquitetura.

### O que é o GoReadCode
O GoReadCode é uma plataforma de **Code Intelligence** que combina análise estática, engenharia reversa automatizada e Inteligência Artificial para transformar qualquer base de código em conhecimento estruturado e acessível.

**Princípio fundamental:** a plataforma nunca tenta alterar um código antes de compreendê-lo completamente. Ao receber um projeto, executa análise profunda sobre:

- Arquitetura e padrões
- Regras de negócio
- Dependências e relações
- Tecnologias utilizadas
- Qualidade e code smells
- Segurança e vulnerabilidades
- Cobertura de testes
- Performance e gargalos
- Fluxo de execução completo

Somente após essa etapa, atua como assistente de desenvolvimento, documentação, debugging e ensino.

---

## 2. Problema e Solução

### O Problema
Projetos de médio e grande porte possuem:
- Milhares de arquivos e centenas de dependências
- Documentação ausente ou desatualizada
- Regras de negócio implícitas no código
- Arquiteturas difíceis de compreender
- Medo de modificar sistemas legados sem entendê-los

Um desenvolvedor gasta em média **dias ou semanas** tentando entender um sistema antes de conseguir modificá-lo com segurança.

### A Solução
O GoReadCode reduz esse tempo de compreensão **de dias para minutos**.

```
Importar projeto
       ↓
Indexação automática
       ↓
Análise profunda (arquitetura · qualidade · segurança · testes)
       ↓
Mapa de conhecimento do projeto
       ↓
Interface conversacional com IA especializada
       ↓
Explicação · Documentação · Debug · Ensino
```

---

## 3. Público-Alvo e Personas

| Persona | Perfil | Necessidade Principal |
|---------|--------|-----------------------|
| **Lucas** | Desenvolvedor Júnior | Aprender programação usando projetos reais |
| **Ana** | Tech Lead | Compreender rapidamente projetos desconhecidos |
| **Pedro** | Arquiteto de Software | Auditar sistemas corporativos antes de propor mudanças |
| **Mariana** | QA | Compreender funcionalidades antes de criar testes |
| **João** | Professor | Usar código real como material didático em aulas |
| **Bruno** | DevOps | Entender pipelines, scripts e arquitetura de deploy |
| **Clara** | Segurança | Realizar auditorias de vulnerabilidades |
| **Diego** | Estudante | Aprender lendo projetos open source guiados por IA |

---

## 4. Diferenciais Competitivos

| Diferencial | Descrição |
|-------------|-----------|
| **Compreensão antes da ação** | Nunca modifica código sem antes construir contexto completo |
| **Explicações em múltiplos níveis** | Do panorama arquitetural (C4) até análise linha a linha |
| **Foco em ensino** | Transforma código complexo em material didático interativo |
| **Análise unificada** | Arquitetura · qualidade · segurança · testes · performance · documentação em um só lugar |
| **Rastreabilidade total** | Toda conclusão é ligada à sua evidência no código-fonte |
| **Extensibilidade** | Novas linguagens, agentes e analisadores sem alterar o núcleo |
| **Multi-LLM e Multi-Fonte** | Suporte a diferentes provedores de IA e origens de código |

### Comparativo com o Mercado

| Funcionalidade | GoReadCode | Copilot | Cursor | Sourcegraph | SonarQube |
|----------------|:----------:|:-------:|:------:|:-----------:|:---------:|
| Análise arquitetural | ✅ Completa | ❌ | Parcial | Parcial | ❌ |
| Explicação linha a linha | ✅ | Parcial | ✅ | ❌ | ❌ |
| Modo Professor / Ensino | ✅ | ❌ | ❌ | ❌ | ❌ |
| Engenharia Reversa | ✅ | ❌ | ❌ | Parcial | ❌ |
| Auditoria de Segurança | ✅ | ❌ | ❌ | ❌ | ✅ |
| Documentação automática | ✅ Completa | Parcial | Parcial | ❌ | ❌ |
| Multi-LLM | ✅ | ❌ | ✅ | ❌ | ❌ |
| Diagramas automáticos | ✅ | ❌ | ❌ | Parcial | ❌ |
| Sandbox Visual | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Onde Pode Ser Utilizado

- 🏠 **Em casa** — estudos, projetos pessoais, aprendizado autodidata
- 🎓 **Em instituições de ensino** — universidades, cursos técnicos, bootcamps
- 💼 **Em empresas** — onboarding, auditoria, manutenção de sistemas legados
- 👥 **Em equipes** — revisão de código, compartilhamento de conhecimento
- 🔬 **Em pesquisas** — acadêmicas e científicas
- 🌎 **Em projetos Open Source** — qualquer repositório público
- 🚀 **Em startups** — crescimento acelerado sem perda de contexto técnico
- 🏢 **Em grandes empresas** — sistemas corporativos complexos

---

## 6. Fontes de Entrada Suportadas

### 6.1 Repositórios Git
- GitHub (público e privado via autenticação)
- GitLab
- Bitbucket
- Azure DevOps
- Gitea
- Servidores Git corporativos e self-hosted

### 6.2 Código-Fonte Direto
- Upload de arquivos individuais
- Upload de pastas compactadas (`.zip`, `.tar`, `.rar`)
- Arrastar e soltar (Drag & Drop) de arquivos e pastas
- Colar código diretamente na interface (modo paste)

### 6.3 Análise por URL de Aplicação
O usuário informa a URL de uma aplicação web e o sistema identifica:
- Frameworks de frontend detectáveis
- Bibliotecas JavaScript expostas
- Headers HTTP e certificados
- APIs públicas expostas
- Desempenho inicial (Core Web Vitals)
- Segurança básica (CSP, HSTS, CORS, X-Frame-Options)
- SEO e acessibilidade

> ⚠️ **Limitação:** análise por URL restringe-se às informações publicamente expostas. O código-fonte interno requer integração via repositório.

### 6.4 APIs e Serviços
- REST — análise de contratos e endpoints
- GraphQL — análise de schemas e resolvers
- gRPC — análise de protobufs
- WebSocket — análise de eventos e mensagens

### 6.5 Integrações com IDEs (futuro)
- Visual Studio Code
- JetBrains (IntelliJ, PyCharm, WebStorm, Rider)
- Visual Studio
- Neovim / Vim
- Eclipse

---

## 7. Funcionalidades

### 7.1 Leitura Inteligente
- Detecção automática de linguagens, frameworks e bibliotecas
- Identificação de ORMs, bancos de dados, ferramentas de build
- Reconhecimento de Docker, CI/CD, cloud e containers
- Detecção de package managers e configurações

### 7.2 Indexação e Mapeamento
- Leitura recursiva completa do projeto
- Mapa de módulos e dependências
- Mapa de chamadas entre funções e serviços
- Mapa de responsabilidades por componente
- Grafo de dependências interativo

### 7.3 Engenharia Reversa
- Reconstrução automática da arquitetura
- Diagramas C4 (contexto, container, componente, código)
- Diagramas UML (classes, sequência, estado, atividades, componentes)
- Diagramas de banco de dados e relacionamentos
- Mapeamento de APIs e fluxos de integração

### 7.4 Ensino e Explicação
Níveis de granularidade suportados:

```
Projeto completo
    └── Pasta / Módulo
         └── Arquivo
              └── Classe / Interface
                   └── Método / Função
                        └── Variável
                             └── Linha individual
```

- Modo Professor com analogias e exemplos didáticos
- Trilhas de aprendizado baseadas no projeto
- Quizzes e flashcards gerados a partir do código

### 7.5 Debug Assistido
1. Compreensão do contexto completo antes do diagnóstico
2. Localização da origem do problema
3. Explicação da causa raiz com rastreabilidade
4. Análise do impacto da falha
5. Sugestão e comparação de soluções alternativas

### 7.6 Análise de Qualidade
- Código morto e duplicações
- Acoplamento excessivo e alta complexidade ciclomática
- Code Smells, violações de SOLID e Clean Code
- Padrões de DDD e arquitetura
- Anti-patterns e débito técnico

### 7.7 Auditoria de Segurança
- SQL Injection, XSS, CSRF, SSRF
- Segredos, tokens e senhas expostas no código
- Dependências com CVEs conhecidos
- OWASP Top 10 completo

### 7.8 Análise de Testes
- Identificação de testes unitários, integração e E2E
- Estimativa de cobertura
- Mocks, fixtures e frameworks utilizados
- Geração de estratégia de testes com exemplos

### 7.9 Análise de Performance
- Loops ineficientes e consultas lentas
- Memory leaks e N+1 queries
- Uso de cache e complexidade algorítmica

### 7.10 Documentação Automática
- README completo e atualizado
- Wiki técnica do projeto
- Documentação de endpoints e contratos de API
- Schema de banco de dados documentado
- Diagramas em múltiplos formatos (Mermaid, PlantUML, SVG, PNG)

---

## 8. Requisitos

### 8.1 Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF-001 | Ler e indexar projetos completos de forma recursiva |
| RF-002 | Identificar linguagens, frameworks e bibliotecas automaticamente |
| RF-003 | Reconstruir a arquitetura do projeto |
| RF-004 | Explicar código em qualquer nível de granularidade |
| RF-005 | Gerar documentação automática em múltiplos formatos |
| RF-006 | Detectar bugs, vulnerabilidades e code smells |
| RF-007 | Sugerir melhorias sem alterar arquivos automaticamente |
| RF-008 | Funcionar como ferramenta de ensino interativo |
| RF-009 | Suportar múltiplas fontes de entrada de código |
| RF-010 | Gerar diagramas e visualizações automáticas |

### 8.2 Requisitos Não Funcionais

- **Performance** — respostas rápidas mesmo em projetos com milhares de arquivos
- **Escalabilidade** — múltiplos usuários e projetos simultâneos
- **Segurança** — código-fonte isolado por tenant, criptografado em repouso e em trânsito
- **Modularidade** — novos analisadores e agentes sem alterar o núcleo
- **Observabilidade** — logs, métricas e rastreamento em todas as operações críticas
- **Disponibilidade** — SLA 99.9% (Enterprise)
- **Privacidade por padrão** — nenhum dado compartilhado sem consentimento explícito

### 8.3 Fora do Escopo — V1

> ❌ As funcionalidades abaixo estão explicitamente fora do escopo da versão inicial:

- Escrita automática de código sem solicitação explícita
- Deploy automático de aplicações
- Refatoração automática sem aprovação do usuário
- Execução remota de código do projeto analisado
- Alteração direta de arquivos sem confirmação

---

## 9. Arquitetura de Software

### 9.1 Princípios Arquiteturais

- **Domain-Driven Design (DDD)** — organizado em domínios de negócio, não em tecnologias
- **Clean Architecture** — separação clara entre domínio, aplicação e infraestrutura
- **SOLID** — aplicado em toda a base de código
- **API First** — contratos definidos antes da implementação
- **AI First** — IA como cidadã de primeira classe
- **Event-Driven** — comunicação assíncrona entre domínios
- **Contexto antes da ação** — nenhum módulo atua sem contexto suficiente
- **Segurança por padrão** — proteção desde a concepção

### 9.2 Bounded Contexts

| Contexto | Responsabilidade |
|----------|-----------------|
| Workspace Context | Ambiente de trabalho, configurações, projetos do usuário |
| Project Context | Ciclo de vida do projeto, importação, status |
| Code Analysis Context | Parsing, indexação, AST, símbolos |
| Reverse Engineering Context | Arquitetura, diagramas, fluxos |
| AI Context | Agentes, orquestração, memória, RAG |
| Documentation Context | Geração de artefatos e exportações |
| Learning Context | Trilhas, quizzes, modo professor |
| Debug Context | Diagnósticos, causa raiz, impacto |
| Visualization Context | Diagramas, preview, sandbox |
| Collaboration Context | Times, compartilhamento, histórico |
| Security Context | Autenticação, autorização, auditoria |
| Administration Context | Gestão de planos, usuários, billing |

### 9.3 Entidades do Domínio

```
Workspace
├── id, nome, owner_id, configurações
└── → Projetos[]

Projeto
├── id, nome, origem, linguagem_principal, frameworks[], status
├── → Análises[]
├── → Arquivos[]
├── → Diagramas[]
└── → Documentos[]

Análise
├── id, projeto_id, versão, status, duração, métricas
└── → Riscos[], Sugestões[]

Arquivo
├── caminho, hash, linguagem, tamanho
└── → Símbolos[] (classes, funções, variáveis)

Símbolo
├── tipo, nome, assinatura, linha_início, linha_fim
└── → Dependências[], Embedding

Agente IA
├── nome, especialidade, modelo, capacidades
└── → Configurações, Nível de Confiança

Conversa
├── usuário_id, projeto_id, sessão
└── → Mensagens[], Contexto, Memória
```

### 9.4 Eventos de Domínio

```
ProjetoImportado       → dispara indexação
ArquivoIndexado        → atualiza grafo de dependências
ArquiteturaReconstruída → atualiza dashboard
AnáliseConcluída       → notifica usuário
BugDetectado           → registra no relatório de qualidade
SugestãoCriada         → disponibiliza na interface
DocumentaçãoAtualizada → invalida cache de exportação
DiagramaGerado         → disponibiliza para visualização
ProjetoCompartilhado   → cria permissão para colaboradores
```

### 9.5 Fluxo Interno de Análise

```
Importação (repositório / upload / paste)
           ↓
Normalização e filtro (ignora: node_modules, .git, dist, build)
           ↓
Parser multi-linguagem com Tree-sitter
           ↓
Geração de AST por arquivo
           ↓
Extração de símbolos (classes, funções, variáveis, imports)
           ↓
Indexação no banco relacional (PostgreSQL)
           ↓
Geração de embeddings semânticos
           ↓
Armazenamento no banco vetorial (pgvector / Qdrant)
           ↓
Construção do grafo de dependências
           ↓
Análise de arquitetura e padrões
           ↓
Evento: AnáliseConcluída
           ↓
Dashboard atualizado para o usuário
```

### 9.6 Módulos Principais

| Módulo | Responsabilidade |
|--------|-----------------|
| Ingestão de Projeto | Conectores de repositório, upload, validação e normalização |
| Parser & AST Engine | Parsing multi-linguagem com Tree-sitter |
| Motor de Indexação | Indexação incremental, versionamento de artefatos |
| Grafo de Dependências | Construção e manutenção das relações entre entidades |
| Banco Vetorial | Geração e armazenamento de embeddings para RAG |
| Motor de IA | Orquestrador de agentes, contexto e memória |
| Documentador | Geração de README, Wiki, diagramas e relatórios |
| Debugger Assistido | Diagnóstico com análise de impacto e rastreabilidade |
| Módulo de Ensino | Trilhas, quizzes, modo professor interativo |
| Visualization Engine | Preview, diagramas, sandbox e comparação visual |
| Interface Conversacional | Chat, histórico de sessão, memória de projeto |

---

## 10. Inteligência Artificial

### 10.1 Arquitetura Multi-Agente

O sistema de IA é composto por um **orquestrador central** e **agentes especializados** independentes por domínio. O orquestrador decide qual agente (ou combinação) responde cada solicitação com base no tipo de pergunta e contexto disponível.

### 10.2 Agentes Especializados

| Agente | Especialidade |
|--------|--------------|
| **Arquiteto** | Analisa e explica arquitetura, padrões e decisões de design |
| **Professor** | Explica código de forma didática com analogias progressivas |
| **Debugger** | Diagnostica falhas, causa raiz e impacto de mudanças |
| **Documentador** | Gera README, Wiki, docstrings e documentação técnica |
| **Segurança** | Detecta OWASP, segredos expostos, dependências inseguras |
| **Performance** | Identifica gargalos, N+1 queries, memory leaks |
| **Qualidade** | Detecta code smells, violações SOLID, duplicações |
| **Testador** | Analisa cobertura e gera estratégia de testes com exemplos |
| **Engenheiro Reverso** | Reconstrói arquitetura, fluxos e diagramas |
| **Orquestrador** | Seleciona agentes, gerencia contexto e memória de sessão |

### 10.3 RAG (Retrieval-Augmented Generation)

```
1. Indexação
   Código → fragmentado em chunks semânticos → embeddings gerados

2. Recuperação
   Pergunta → busca por similaridade vetorial → chunks relevantes selecionados

3. Geração
   LLM recebe: pergunta + chunks relevantes + contexto do projeto → resposta rastreável
```

- Embeddings com modelos especializados em código
- Busca híbrida (semântica + keyword)
- Reranking dos resultados para maior precisão
- Cache de embeddings para reutilização
- Toda resposta cita a evidência no código-fonte

### 10.4 Memória e Contexto

| Tipo | Descrição |
|------|-----------|
| Memória de Sessão | Histórico da conversa atual |
| Memória de Projeto | Contexto acumulado: arquitetura, decisões, análises anteriores |
| Memória de Usuário | Preferências, nível de experiência, áreas de interesse |
| Contexto de Arquivo | Análise do arquivo atual e seus relacionamentos |
| Contexto Global | Mapa completo do projeto para referências cruzadas |

### 10.5 Prompt Engine

- Templates por tipo de análise e por agente
- Injeção dinâmica de contexto relevante (RAG + memória)
- Chain-of-Thought para diagnósticos complexos
- Indicação explícita de nível de confiança por afirmação
- Fallback gracioso quando o contexto é insuficiente
- Grounding em evidências do código para evitar alucinações
- Suporte a múltiplos provedores: Anthropic, OpenAI, Groq, Ollama

### 10.6 Provedores de LLM Suportados

| Provider | Modelos | Notas |
|----------|---------|-------|
| **Anthropic** | claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | Padrão recomendado |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo | Alternativa principal |
| **Groq** | llama-3.3-70b, mixtral-8x7b | Alta velocidade / baixo custo |
| **Ollama** | codellama, deepseek-coder, qwen2.5-coder | 100% local, sem custo de API |

---

## 11. Visualização Inteligente

### 11.1 Intelligent Visualization Engine

> **Princípio:** Sempre que uma informação puder ser compreendida mais rapidamente por meio de representação visual, o GoReadCode oferece essa visualização.

### 11.2 Preview de Interface

| Framework | Tipo de Preview |
|-----------|----------------|
| React / Next.js | Preview automático do componente alterado |
| Vue / Angular | Preview da página ou componente afetado |
| HTML / CSS | Renderização imediata do markup e estilos |
| Flutter | Simulação da tela mobile |
| React Native | Preview do componente nativo |

### 11.3 Sandbox Seguro

- Alterações executadas em ambiente isolado
- Comparação visual antes/depois lado a lado
- Nenhum arquivo original modificado sem confirmação explícita do usuário
- Descarte de alterações sem consequências

### 11.4 Tipos de Diagramas Gerados

- **C4:** Contexto · Containers · Componentes · Código
- **UML:** Classes · Sequência · Estado · Atividades · Componentes
- **Banco de Dados:** DER completo com relacionamentos
- **Dependências:** Grafo interativo de módulos
- **Fluxo de APIs:** REST · GraphQL · WebSocket
- **Arquitetura:** Infraestrutura, deploy, serviços

### 11.5 Visualização de Impacto de Alterações

Antes de modificar qualquer arquivo, a plataforma responde:
- Quais arquivos e módulos serão afetados
- Quais telas e componentes de UI dependem da mudança
- Quais APIs e contratos poderão ser impactados
- Quais testes deverão ser revisados ou criados
- Estimativa de complexidade da mudança

---

## 12. Stack Tecnológica

### Frontend
```
Next.js 14+      → Framework React com App Router e Server Components
React 18         → UI e estado
TypeScript       → Tipagem estática
TailwindCSS      → Estilização utilitária
Shadcn UI        → Componentes acessíveis e customizáveis
```

### Backend
```
NestJS           → Framework Node.js modular e escalável
TypeScript       → Tipagem estática
Python           → Análise estática, processamento de AST, IA
```

### Dados
```
PostgreSQL       → Banco relacional principal + pgvector para embeddings
Redis            → Cache, sessões, filas de processamento
Qdrant           → Banco vetorial dedicado (opcional, produção)
```

### IA e Análise
```
Tree-sitter      → Parser multi-linguagem incremental
LangChain / SDK  → Orquestração de agentes e RAG
Embeddings       → Modelos especializados em código
MCP              → Model Context Protocol para ferramentas
```

### Infraestrutura
```
Docker           → Containerização de todos os serviços
Docker Compose   → Ambiente de desenvolvimento local
Kubernetes       → Orquestração em produção (fase Enterprise)
GitHub Actions   → CI/CD automatizado
OpenTelemetry    → Observabilidade, logs e métricas
```

### Autenticação
```
OAuth 2.0        → Login com GitHub, GitLab, Google
SAML 2.0         → SSO Enterprise
JWT              → Tokens de sessão
```

---

## 13. Banco de Dados

### 13.1 Princípios
- PostgreSQL como banco principal
- UUID como identificador primário em todas as entidades
- Todas as entidades possuem `created_at`, `updated_at`, `deleted_at` (soft delete)
- Isolamento por tenant em todas as tabelas de dados de usuário
- Migrações versionadas e reversíveis
- Todos os artefatos gerados são versionados

### 13.2 Tabelas Principais

| Tabela | Campos Principais |
|--------|------------------|
| `workspaces` | id, name, owner_id, settings, created_at |
| `users` | id, email, name, plan, preferences, created_at |
| `projects` | id, workspace_id, name, origin, status, language, created_at |
| `project_analyses` | id, project_id, version, status, duration, metrics |
| `files` | id, project_id, path, language, hash, size, content_ref |
| `symbols` | id, file_id, type, name, signature, line_start, line_end |
| `dependencies` | id, project_id, source_id, target_id, dep_type, weight |
| `embeddings` | id, symbol_id, vector, model, created_at |
| `conversations` | id, user_id, project_id, created_at, context |
| `messages` | id, conversation_id, role, content, agent, created_at |
| `documents` | id, project_id, type, version, content, format |
| `diagrams` | id, project_id, type, data, layout, version |

---

## 14. APIs

### 14.1 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/projects/import` | Importa projeto (repositório, upload ou paste) |
| `GET`  | `/api/projects/:id` | Dados e status do projeto |
| `GET`  | `/api/projects/:id/analysis` | Análise mais recente |
| `GET`  | `/api/projects/:id/files` | Lista arquivos indexados |
| `GET`  | `/api/projects/:id/files/:fileId` | Conteúdo e análise de um arquivo |
| `POST` | `/api/projects/:id/chat` | Mensagem para a IA no contexto do projeto |
| `GET`  | `/api/projects/:id/diagrams` | Lista diagramas gerados |
| `POST` | `/api/projects/:id/documents/generate` | Solicita geração de documentação |
| `GET`  | `/api/projects/:id/security` | Relatório de segurança |
| `GET`  | `/api/projects/:id/quality` | Relatório de qualidade |
| `GET`  | `/api/projects/:id/performance` | Relatório de performance |
| `POST` | `/api/projects/:id/explain` | Explica arquivo, função ou linha |

### 14.2 Padrões de API
- Autenticação via `Bearer Token (JWT)` em todos os endpoints protegidos
- Respostas paginadas com cursor para listas grandes
- Streaming via **Server-Sent Events** para respostas longas da IA
- Rate limiting por API key e por plano
- Erros padronizados com código, mensagem e campo problemático
- GraphQL disponível para consultas complexas

---

## 15. UX / UI

### 15.1 Identidade Visual

**Paleta de Cores:**

| Token | Hex | Uso |
|-------|-----|-----|
| `--accent` | `#388BFD` | Ações primárias, links, bordas de destaque |
| `--accent-2` | `#58A6FF` | Hover e variações do accent |
| `--bg` | `#0D1117` | Background principal |
| `--sidebar` | `#161B22` | Sidebars e painéis secundários |
| `--panel` | `#1C2128` | Painéis e modais |
| `--border` | `#30363D` | Bordas e divisórias |
| `--text` | `#E6EDF3` | Texto principal |
| `--muted` | `#7D8590` | Texto secundário e placeholders |
| `--green` | `#3FB950` | Sucesso, testes passando |
| `--orange` | `#F0883E` | Aviso, atenção |
| `--red` | `#FF7B72` | Erro, código problemático, keywords |

**Tipografia:**
- **Interface:** Inter (sans-serif)
- **Código:** JetBrains Mono / Fira Code (monospace)

### 15.2 Telas Principais

| Tela | Conteúdo Principal |
|------|--------------------|
| Landing Page | Hero, demonstração, CTAs, planos, depoimentos |
| Onboarding | Config do LLM, importação do 1º projeto, tour guiado |
| Dashboard | Lista de projetos, status de análise, atividade recente |
| Workspace | Sidebar com árvore de arquivos · viewer de código · painel de análise |
| Chat IA | Interface conversacional com histórico e sugestões de perguntas |
| Visualizador de Código | Syntax highlight, linhas clicáveis, busca, minimap |
| Diagramas | Visualização interativa de C4, UML, dependências e banco |
| Relatório de Segurança | Vulnerabilidades com severidade, evidências e sugestões |
| Relatório de Qualidade | Code smells, métricas, acoplamento, complexidade |
| Modo Professor | Explicação progressiva, quizzes e trilha de aprendizado |
| Modo Debug | Diagnóstico com causa raiz, impacto e comparação de soluções |
| Documentação Gerada | Preview do README/Wiki, exportação (MD, PDF, HTML) |
| Configurações | Perfil, LLM provider, API keys, plano |
| Admin Enterprise | Gestão de usuários, times, projetos, uso e faturamento |

### 15.3 Layout Principal do Workspace

```
┌─────────────────────────────────────────────────────────────┐
│  Header: GoReadCode · nome do projeto · status · config LLM  │
├──────────┬───────────────────────────────┬───────────────────┤
│          │                               │                   │
│  Sidebar │      Visualizador de Código   │  Painel de Análise│
│          │                               │                   │
│  Árvore  │  • Syntax highlight           │  Tabs:            │
│  de      │  • Linhas clicáveis           │  🗺️ Visão Geral   │
│  Arquivos│  • Linha selecionada          │  📋 Regras        │
│          │    destacada em azul          │  🧹 Cód. Morto    │
│  [240px] │  • Path + linguagem +         │  🧪 Testes        │
│          │    tamanho no header          │  🎓 Explicar      │
│          │                               │                   │
│          │                               │  [480px]          │
└──────────┴───────────────────────────────┴───────────────────┘
```

### 15.4 Acessibilidade
- WCAG 2.1 nível AA como padrão mínimo
- Suporte completo a navegação por teclado
- ARIA labels e roles em todos os componentes
- Contraste mínimo de 4.5:1 para texto normal
- Suporte a `prefers-reduced-motion`
- Internacionalização (i18n) preparada desde o início

---

## 16. Segurança

- Isolamento total de dados por tenant
- Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)
- API keys e tokens nunca armazenados em texto plano
- Tokens de repositório criptografados com chave de tenant
- OWASP Top 10 aplicado à própria plataforma
- Logs de auditoria imutáveis para operações sensíveis
- Security headers completos (CSP, HSTS, X-Frame-Options, etc.)
- Varredura automática de dependências (Dependabot)
- Pentesting periódico com disclosure responsável

---

## 17. Roadmap

### Fase 1 — MVP *(em andamento)*
- [x] Interface web base com Next.js
- [x] Upload de arquivos, pasta e paste de código
- [x] Árvore de arquivos com navegação
- [x] Visualizador de código com syntax highlight
- [x] Clique em linha para selecionar e explicar
- [x] Painel de análise com streaming (5 análises)
- [x] Configuração multi-LLM na UI
- [ ] Integração com GitHub (repositórios públicos)
- [ ] Indexação persistente no banco
- [ ] Dashboard com histórico de projetos
- [ ] Geração de documentação (README/Wiki)

### Fase 2 — Core Features
- [ ] Diagramas automáticos (C4, UML, dependências)
- [ ] Grafo de dependências interativo
- [ ] Modo Professor com trilhas de aprendizado
- [ ] Modo Debug com análise de impacto
- [ ] Auditoria de qualidade (SOLID, Clean Code, Code Smells)
- [ ] Sistema de autenticação (OAuth GitHub/Google)
- [ ] Workspace e projetos persistentes por usuário

### Fase 3 — Segurança e Performance
- [ ] Auditoria de segurança (OWASP Top 10, CVEs)
- [ ] Análise de performance (N+1, memory leaks)
- [ ] Análise de cobertura de testes
- [ ] Plugin para VS Code
- [ ] Integração com GitLab e Bitbucket

### Fase 4 — Colaboração e Integração
- [ ] Colaboração em equipe com histórico compartilhado
- [ ] Comparação entre versões e branches
- [ ] Sugestões com rastreabilidade e aprovação
- [ ] Webhooks para eventos de análise
- [ ] API pública para integração em CI/CD

### Fase 5 — Plataforma Completa
- [ ] Marketplace de agentes especializados
- [ ] Aplicativo Desktop (Electron)
- [ ] Planos SaaS com billing automatizado
- [ ] Enterprise: SSO, SAML, on-premise
- [ ] Aprendizado contínuo por organização

---

## 18. Métricas de Sucesso

| KPI | Definição |
|-----|-----------|
| Tempo de indexação | Tempo médio para indexar projeto de tamanho típico |
| Tempo de resposta da IA | Latência média para responder perguntas sobre código |
| Precisão de detecção | Acurácia na identificação de linguagens e frameworks |
| Qualidade da documentação | Avaliação dos artefatos gerados (humana e automatizada) |
| Satisfação do usuário | NPS e CSAT coletados pós-análise |
| Redução de onboarding | Tempo médio reduzido para compreender projeto desconhecido |
| Cobertura de explicações | % do projeto coberto com explicações do projeto à linha |
| Detecção de vulnerabilidades | Acurácia e recall na detecção de issues de segurança |
| Engajamento | DAU/MAU, sessões por usuário, retenção em 30 dias |
| Conversão freemium → pago | Taxa de upgrade de plano gratuito para pago |

---

## 19. Monetização

| Plano | Descrição |
|-------|-----------|
| **Free** | Projetos públicos, análise básica, limite de arquivos por análise |
| **Pro** | Projetos privados, análise completa, histórico, exportação PDF |
| **Teams** | Multi-usuário, colaboração, integrações Git, suporte prioritário |
| **Enterprise** | SSO, SAML, SLA 99.9%, on-premise, agentes customizados |
| **Educação** | Desconto institucional, turmas, modo professor, relatórios de progresso |
| **Marketplace** | Agentes e extensões de terceiros com revenue share |
| **API Pública** | Acesso programático pago por uso (pay-per-call) |

---

## 20. Riscos

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| Privacidade do código-fonte | 🔴 Alto | Isolamento por tenant, criptografia, políticas claras |
| Alucinações da IA | 🔴 Alto | RAG, citação de evidências, indicação de confiança |
| Custo de tokens de LLM | 🟡 Médio | Caching, chunking inteligente, suporte a modelos locais |
| Suporte a linguagens exóticas | 🟡 Médio | Arquitetura extensível de parsers com Tree-sitter |
| Competição de grandes players | 🟡 Médio | Foco no nicho de compreensão, ensino e auditoria |
| Latência em projetos grandes | 🟡 Médio | Indexação incremental e processamento assíncrono |

---

## 21. Constituição do Produto

> Princípios invioláveis que orientam todas as decisões de produto e engenharia do GoReadCode.

### O GoReadCode NUNCA deve:
- Modificar código do usuário sem solicitação e confirmação explícita
- Inventar respostas quando não houver evidências suficientes no código analisado
- Esconder limitações da análise — toda incerteza deve ser comunicada claramente
- Expor código confidencial de um projeto para outros usuários
- Priorizar velocidade de resposta em detrimento de precisão e rastreabilidade
- Armazenar código-fonte além do período necessário sem consentimento

### O GoReadCode SEMPRE deve:
- Explicar o raciocínio quando solicitado — todo diagnóstico deve ser auditável
- Preservar a rastreabilidade entre conclusões e evidências no código
- Respeitar políticas de privacidade definidas pelo usuário e pela organização
- Indicar o nível de confiança de cada análise gerada
- Apresentar alternativas quando múltiplas interpretações são possíveis
- Compreender sempre antes de agir

### Princípio Fundamental
> A IA é um apoio à inteligência humana, não uma substituição. Decisões críticas permanecem transparentes, auditáveis e sob controle do usuário. O GoReadCode amplifica a capacidade do desenvolvedor; nunca a substitui.

---

## 22. Glossário

| Termo | Definição |
|-------|-----------|
| **AST** | Abstract Syntax Tree — representação estruturada do código após parsing |
| **Bounded Context** | Limite explícito de um domínio no DDD, com modelo próprio |
| **Code Intelligence** | Capacidades de análise semântica de código-fonte por IA |
| **Code Smell** | Padrão no código que indica possível problema de design |
| **Embedding** | Representação vetorial numérica de texto ou código para busca semântica |
| **Grafo de Dependências** | Estrutura que mapeia relações entre módulos, arquivos e funções |
| **LLM** | Large Language Model — modelo de linguagem de grande escala |
| **MCP** | Model Context Protocol — protocolo para comunicação entre agentes e ferramentas |
| **N+1 Query** | Anti-padrão onde N consultas extras são geradas para cada item de uma lista |
| **OWASP Top 10** | Lista das 10 vulnerabilidades mais críticas em aplicações web |
| **Parser** | Componente que lê código-fonte e o transforma em estrutura analisável |
| **RAG** | Retrieval-Augmented Generation — geração aumentada por recuperação de contexto |
| **Tenant** | Cliente ou organização isolada dentro de uma plataforma multi-inquilino |
| **Tree-sitter** | Parser multi-linguagem incremental usado para análise de código |
| **Vector DB** | Banco de dados otimizado para armazenar e consultar vetores de embedding |

---

## 23. Status de Desenvolvimento

### Estrutura Atual do Projeto

```
ReadCode/
├── goreadcode.md              ← Este arquivo (PRD ativo)
├── GoReadCode_PRD_v1.0.pdf    ← PRD exportado em PDF
├── GoReadCode_PRD_generator.py
└── readcode/                  ← Aplicação web (MVP)
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx           ← Página principal com estado global
    │   └── globals.css
    ├── components/
    │   ├── UploadZone.tsx     ← Upload, drag&drop, paste
    │   ├── FileTree.tsx       ← Árvore de arquivos
    │   ├── CodeViewer.tsx     ← Visualizador com linha clicável
    │   ├── AnalysisPanel.tsx  ← 5 análises com streaming
    │   └── LLMConfig.tsx      ← Config multi-provider
    ├── lib/
    │   ├── llm.ts             ← Abstração multi-LLM com streaming
    │   ├── prompts.ts         ← Prompts por tipo de análise
    │   ├── fileParser.ts      ← Parser de arquivos e árvore
    │   └── syntaxHighlight.ts ← Syntax highlight leve
    ├── types/index.ts
    └── package.json
```

### Próximos Passos Imediatos

1. **Integração GitHub** — importar repositórios públicos via URL
2. **Backend NestJS** — persistência de projetos e análises no banco
3. **Autenticação** — OAuth com GitHub e Google
4. **Dashboard** — histórico de projetos do usuário
5. **Diagramas** — geração automática com Mermaid
6. **Indexação real** — Tree-sitter + PostgreSQL + pgvector

### Como Rodar o MVP

```bash
# 1. Acesse a pasta do projeto
cd /mnt/c/Users/jeffe/Claude/Projects/ReadCode/readcode  # WSL
# ou
cd C:\Users\jeffe\Claude\Projects\ReadCode\readcode       # Windows

# 2. Instale dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra no navegador
# http://localhost:3000
```

**Configurar LLM:** clique em "Configurar LLM" na interface → escolha o provider → cole a API key.

---

*GoReadCode — Master Product Document v1.0 · Junho 2026*
