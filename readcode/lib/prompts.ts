export const SYSTEM_PROFESSOR = `Você é o ReadCode — um professor sênior de programação especializado em explicar projetos reais para desenvolvedores.
Seu objetivo é ensinar, não apenas informar. Explique de forma clara, didática e progressiva.
Use exemplos, analogias e contexto de negócio quando relevante. Responda sempre em português do Brasil.
Formate suas respostas em Markdown para melhor legibilidade.`;

export function promptOverview(files: { path: string; content: string }[]): string {
  const codeBlock = files
    .map((f) => `### Arquivo: ${f.path}\n\`\`\`\n${f.content.slice(0, 3000)}\n\`\`\``)
    .join("\n\n");

  return `Analise os seguintes arquivos de código e forneça uma **visão geral completa** do projeto.

Inclua:
1. **Resumo do projeto** – O que este projeto faz? Qual é seu propósito?
2. **Arquitetura** – Como está organizado? Quais padrões arquiteturais usa?
3. **Stack tecnológica** – Linguagens, frameworks, bibliotecas identificadas
4. **Fluxo principal** – Como o código executa, do início ao fim
5. **Qualidade geral** – Pontos positivos e áreas de melhoria
6. **Complexidade estimada** – Simples / Médio / Complexo e por quê

${codeBlock}`;
}

export function promptBusinessRules(files: { path: string; content: string }[]): string {
  const codeBlock = files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2500)}\n\`\`\``)
    .join("\n\n");

  return `Analise o código e extraia todas as **regras de negócio** presentes.

Para cada regra encontrada, explique:
- **O que a regra faz** em linguagem natural (não técnica)
- **Onde está implementada** (arquivo e função/método)
- **Por que existe** – qual problema de negócio resolve
- **Possíveis edge cases** não tratados

Organize por módulo/domínio funcional.

${codeBlock}`;
}

export function promptDeadCode(files: { path: string; content: string }[]): string {
  const codeBlock = files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2500)}\n\`\`\``)
    .join("\n\n");

  return `Analise o código em busca de **código morto, desnecessário ou problemático** — especialmente código gerado por "vibe coding" ou geração automática sem revisão.

Identifique e liste:
1. **Funções/métodos nunca chamados** – código que não é referenciado em nenhum lugar
2. **Variáveis não utilizadas** – declaradas mas nunca lidas
3. **Imports desnecessários** – módulos importados mas não usados
4. **Código comentado** – blocos grandes de código comentado
5. **TODO/FIXME esquecidos** – problemas conhecidos não resolvidos
6. **Código duplicado** – lógica repetida que poderia ser extraída
7. **Console.logs/debugs** esquecidos em produção
8. **Feature flags hardcoded** – flags sempre true/false que nunca mudam

Para cada item: arquivo, linha aproximada, e recomendação de ação (remover, refatorar, extrair).

${codeBlock}`;
}

export function promptTests(files: { path: string; content: string }[]): string {
  const codeBlock = files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2500)}\n\`\`\``)
    .join("\n\n");

  return `Analise o código e gere uma **estratégia completa de testes** com exemplos prontos para uso.

Inclua:
1. **Testes Unitários** – Para cada função pura e método crítico
2. **Testes de Integração** – Fluxos que envolvem múltiplos módulos
3. **Testes de Edge Cases** – Casos limite, valores nulos, erros esperados
4. **Testes de Regressão** – Para os bugs mais prováveis baseado no código
5. **Coverage estimado** – O que está coberto vs descoberto

Para cada teste, forneça:
- Nome descritivo do teste
- Código de exemplo (use Jest/Vitest como padrão)
- O que está sendo testado e por quê é importante

${codeBlock}`;
}

export function promptExplainLine(
  filePath: string,
  fileContent: string,
  lineNumber: number,
  contextLines: number = 5
): string {
  const lines = fileContent.split("\n");
  const start = Math.max(0, lineNumber - contextLines - 1);
  const end = Math.min(lines.length, lineNumber + contextLines);
  const contextCode = lines
    .slice(start, end)
    .map((l, i) => `${start + i + 1}: ${l}`)
    .join("\n");

  const targetLine = lines[lineNumber - 1] ?? "";

  return `No arquivo **${filePath}**, o desenvolvedor clicou na **linha ${lineNumber}**:

\`\`\`
${targetLine}
\`\`\`

**Contexto ao redor (linhas ${start + 1}–${end}):**
\`\`\`
${contextCode}
\`\`\`

Explique esta linha de código como um professor sênior explicaria para um desenvolvedor júnior:

1. **O que faz** – Explique o que esta linha faz em linguagem simples
2. **Por que existe** – Qual problema ela resolve no contexto do código
3. **Como funciona** – A mecânica interna (API, padrão, conceito)
4. **Cuidados** – Possíveis problemas, edge cases ou melhorias
5. **Exemplo prático** – Um exemplo simplificado do conceito se for complexo`;
}

export function promptDiagram(files: { path: string; content: string }[]): string {
  const fileList = files.map((f) => f.path).join("\n");
  const codeBlock = files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 1500)}\n\`\`\``)
    .join("\n\n");

  return `Analise os arquivos abaixo e gere um **diagrama Mermaid** representando a arquitetura e as dependências do projeto.

Arquivos do projeto:
${fileList}

IMPORTANTE — Regras para o diagrama:
1. Use o formato flowchart TD (top-down)
2. Agrupe módulos por domínio/camada (ex: UI, API, Utils, Types)
3. Mostre as dependências entre os módulos com setas e labels descritivos
4. Use subgraphs para agrupar camadas relacionadas
5. Mantenha o diagrama legível — máximo 20-25 nós
6. Retorne SOMENTE o bloco de código Mermaid, sem texto adicional, sem explicações

Exemplo de formato esperado (apenas o bloco):
\`\`\`mermaid
flowchart TD
  subgraph UI["Interface"]
    A[page.tsx]
    B[CodeViewer.tsx]
  end
  subgraph LIB["Biblioteca"]
    C[llm.ts]
    D[fileParser.ts]
  end
  A --> B
  A --> C
\`\`\`

${codeBlock}`;
}

export function promptExplainFile(filePath: string, fileContent: string): string {
  return `Explique o arquivo **${filePath}** linha por linha, como um professor ensinando a um desenvolvedor.

Para cada seção do código (não necessariamente linha individual, mas blocos lógicos):
- O que o bloco faz
- Padrões e técnicas usadas
- Por que foi escrito desta forma
- Potenciais melhorias

\`\`\`
${fileContent.slice(0, 6000)}
\`\`\`

Seja didático e progressivo. Comece com o panorama geral do arquivo, depois vá bloco por bloco.`;
}
