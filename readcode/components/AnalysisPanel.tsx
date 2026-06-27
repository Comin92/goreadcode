"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnalysisTab, CodeFile, LLMConfig } from "@/types";
import { streamLLM } from "@/lib/llm";
import {
  promptOverview,
  promptBusinessRules,
  promptDeadCode,
  promptTests,
  promptExplainLine,
  promptExplainFile,
  SYSTEM_PROFESSOR,
} from "@/lib/prompts";

interface Props {
  files: CodeFile[];
  currentFile: CodeFile | null;
  selectedLine: number | null;
  llmConfig: LLMConfig;
  onOpenConfig: () => void;
}

interface TabState {
  content: string;
  loading: boolean;
  error?: string;
  ran: boolean;
}

const EMPTY_TAB: TabState = { content: "", loading: false, ran: false };

const TABS: { id: AnalysisTab; label: string; icon: string; description: string }[] = [
  { id: "overview",        label: "Visão Geral",      icon: "🗺️", description: "Análise completa do projeto" },
  { id: "business-rules",  label: "Regras",            icon: "📋", description: "Extrai regras de negócio" },
  { id: "dead-code",       label: "Cód. Morto",        icon: "🧹", description: "Identifica código não utilizado" },
  { id: "tests",           label: "Testes",             icon: "🧪", description: "Estratégia e exemplos de testes" },
  { id: "explain",         label: "Explicar",           icon: "🎓", description: "Explique linha ou arquivo" },
];

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function MarkdownRenderer({ content }: { content: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const renderInline = (text: string): string =>
    text
      .replace(/`([^`]+)`/g, '<code class="hl-inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  // Split into code blocks and text blocks
  const parts: Array<{ type: "text" | "code"; content: string; lang?: string; id: string }> = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let blockIdx = 0;

  while ((m = codeBlockRe.exec(content)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ type: "text", content: content.slice(lastIdx, m.index), id: `t${blockIdx++}` });
    }
    parts.push({ type: "code", content: m[2].trimEnd(), lang: m[1] || undefined, id: `c${blockIdx++}` });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < content.length) {
    parts.push({ type: "text", content: content.slice(lastIdx), id: `t${blockIdx++}` });
  }

  const renderText = (raw: string): string => {
    const lines = raw.split("\n");
    const out: string[] = [];
    let inUl = false;
    let inOl = false;
    let inTable = false;
    let tableHeader = false;

    const closeList = () => {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (inOl) { out.push("</ol>"); inOl = false; }
    };
    const closeTable = () => {
      if (inTable) { out.push("</tbody></table>"); inTable = false; tableHeader = false; }
    };

    for (const line of lines) {
      // Headers
      if (/^### (.+)/.test(line)) { closeList(); closeTable(); out.push(`<h3>${renderInline(line.replace(/^### /, ""))}</h3>`); continue; }
      if (/^## (.+)/.test(line))  { closeList(); closeTable(); out.push(`<h2>${renderInline(line.replace(/^## /, ""))}</h2>`); continue; }
      if (/^# (.+)/.test(line))   { closeList(); closeTable(); out.push(`<h1>${renderInline(line.replace(/^# /, ""))}</h1>`); continue; }

      // HR
      if (/^---+$/.test(line.trim())) { closeList(); closeTable(); out.push("<hr>"); continue; }

      // Blockquote
      if (/^> (.+)/.test(line)) { closeList(); closeTable(); out.push(`<blockquote>${renderInline(line.replace(/^> /, ""))}</blockquote>`); continue; }

      // Table row  |col|col|col|
      if (/^\|.+\|$/.test(line)) {
        const cells = line.split("|").slice(1, -1).map((c) => c.trim());
        if (/^[\s|:-]+$/.test(line.replace(/[|:-]/g, ""))) {
          // Separator row — transition to tbody
          tableHeader = false;
          continue;
        }
        if (!inTable) {
          closeList();
          out.push('<table><thead><tr>');
          cells.forEach((c) => out.push(`<th>${renderInline(c)}</th>`));
          out.push('</tr></thead><tbody>');
          inTable = true;
          tableHeader = true;
          continue;
        }
        out.push('<tr>');
        cells.forEach((c) => out.push(`<td>${renderInline(c)}</td>`));
        out.push('</tr>');
        continue;
      } else {
        closeTable();
      }

      // Unordered list
      if (/^(\s*)[-*+] (.+)/.test(line)) {
        if (!inUl) { closeList(); out.push("<ul>"); inUl = true; }
        const text = line.replace(/^\s*[-*+] /, "");
        out.push(`<li>${renderInline(text)}</li>`);
        continue;
      }

      // Ordered list
      if (/^\d+\. (.+)/.test(line)) {
        if (!inOl) { closeList(); out.push("<ol>"); inOl = true; }
        const text = line.replace(/^\d+\. /, "");
        out.push(`<li>${renderInline(text)}</li>`);
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        closeList();
        closeTable();
        out.push("<br>");
        continue;
      }

      // Normal paragraph line
      closeList();
      closeTable();
      out.push(`<p>${renderInline(line)}</p>`);
    }

    closeList();
    closeTable();
    return out.join("\n");
  };

  return (
    <div className="markdown-body">
      {parts.map((part) => {
        if (part.type === "code") {
          return (
            <div key={part.id} className="code-block-wrapper" style={{ position: "relative", margin: "12px 0" }}>
              {part.lang && (
                <span className="code-lang-badge" style={{
                  position: "absolute", top: 8, left: 12,
                  fontSize: "10px", color: "var(--editor-muted)",
                  fontFamily: "var(--font-mono)", textTransform: "uppercase",
                }}>
                  {part.lang}
                </span>
              )}
              <button
                onClick={() => copyCode(part.content, part.id)}
                style={{
                  position: "absolute", top: 6, right: 8,
                  fontSize: "10px", padding: "2px 6px", borderRadius: 4,
                  background: "rgba(56,139,253,0.15)", color: "var(--editor-accent)",
                  border: "none", cursor: "pointer",
                }}
              >
                {copied === part.id ? "✓ Copiado" : "Copiar"}
              </button>
              <pre style={{ paddingTop: part.lang ? "28px" : "12px" }}>
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }
        return (
          <div
            key={part.id}
            dangerouslySetInnerHTML={{ __html: renderText(part.content) }}
          />
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalysisPanel({ files, currentFile, selectedLine, llmConfig, onOpenConfig }: Props) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [states, setStates] = useState<Record<AnalysisTab, TabState>>({
    overview:       { ...EMPTY_TAB },
    "business-rules": { ...EMPTY_TAB },
    "dead-code":    { ...EMPTY_TAB },
    tests:          { ...EMPTY_TAB },
    explain:        { ...EMPTY_TAB },
  });

  // Cache explain results per file+line
  const explainCache = useRef<Map<string, TabState>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLineRef = useRef<number | null>(null);

  // Auto-scroll while streaming
  useEffect(() => {
    if (scrollRef.current && states[activeTab].loading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [states, activeTab]);

  const setTabState = useCallback((tab: AnalysisTab, update: Partial<TabState>) => {
    setStates((prev) => ({ ...prev, [tab]: { ...prev[tab], ...update } }));
  }, []);

  const runAnalysis = useCallback(async (tab: AnalysisTab) => {
    if (!llmConfig.apiKey && llmConfig.provider !== "ollama") { onOpenConfig(); return; }
    if (files.length === 0 && !currentFile) return;

    // Check explain cache
    if (tab === "explain" && currentFile) {
      const key = `${currentFile.path}:${selectedLine ?? "file"}`;
      const cached = explainCache.current.get(key);
      if (cached?.ran && !cached.loading) {
        setTabState("explain", cached);
        return;
      }
    }

    setTabState(tab, { content: "", loading: true, error: undefined, ran: true });

    const fileSubset = files.slice(0, 20);

    const prompts: Record<AnalysisTab, () => string> = {
      overview:        () => promptOverview(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      "business-rules":() => promptBusinessRules(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      "dead-code":     () => promptDeadCode(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      tests:           () => promptTests(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      explain:         () => {
        if (selectedLine && currentFile) return promptExplainLine(currentFile.path, currentFile.content, selectedLine);
        if (currentFile) return promptExplainFile(currentFile.path, currentFile.content);
        return "";
      },
    };

    const userPrompt = prompts[tab]();
    if (!userPrompt) {
      setTabState(tab, { loading: false, ran: false, error: "Selecione um arquivo primeiro." });
      return;
    }

    let accumulated = "";
    await streamLLM(llmConfig, SYSTEM_PROFESSOR, userPrompt, {
      onChunk: (text) => {
        accumulated += text;
        setStates((prev) => ({
          ...prev,
          [tab]: { ...prev[tab], content: prev[tab].content + text },
        }));
      },
      onDone: () => {
        setTabState(tab, { loading: false });
        // Save to explain cache
        if (tab === "explain" && currentFile) {
          const key = `${currentFile.path}:${selectedLine ?? "file"}`;
          explainCache.current.set(key, { content: accumulated, loading: false, ran: true });
        }
      },
      onError: (err) => setTabState(tab, { loading: false, error: err }),
    });
  }, [files, currentFile, selectedLine, llmConfig, onOpenConfig, setTabState]);

  // Auto-switch to explain when line selected
  useEffect(() => {
    if (selectedLine !== null) {
      setActiveTab("explain");
    }
  }, [selectedLine]);

  // Auto-run explain when on explain tab and line changes
  useEffect(() => {
    if (
      activeTab === "explain" &&
      selectedLine !== null &&
      selectedLine !== prevLineRef.current &&
      currentFile &&
      (llmConfig.apiKey || llmConfig.provider === "ollama")
    ) {
      prevLineRef.current = selectedLine;
      runAnalysis("explain");
    }
  }, [selectedLine, activeTab, currentFile, llmConfig, runAnalysis]);

  // Reset explain state when file changes
  useEffect(() => {
    setTabState("explain", { ...EMPTY_TAB });
    prevLineRef.current = null;
  }, [currentFile?.path, setTabState]);

  const state = states[activeTab];
  const hasConfig = !!(llmConfig.apiKey || llmConfig.provider === "ollama");

  const getRunLabel = (tab: AnalysisTab) => {
    if (tab === "explain" && selectedLine && currentFile) return `Explicar linha ${selectedLine} de ${currentFile.name}`;
    if (tab === "explain" && currentFile) return `Explicar ${currentFile.name}`;
    return TABS.find((t) => t.id === tab)?.description ?? "Analisar";
  };

  const filesUsed = Math.min(files.length, 20);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--editor-panel)" }}>
      {/* Tab bar */}
      <div className="flex border-b overflow-x-auto flex-shrink-0 scrollbar-none" style={{ borderColor: "var(--editor-border)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {states[tab.id].loading && (
              <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--editor-accent)" }} />
            )}
            {states[tab.id].ran && !states[tab.id].loading && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3fb950" }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!state.ran && !state.loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl mb-4">{TABS.find((t) => t.id === activeTab)?.icon}</div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--editor-text)" }}>
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-sm mb-5 max-w-xs leading-relaxed" style={{ color: "var(--editor-muted)" }}>
              {activeTab === "explain" && !currentFile
                ? "Selecione um arquivo e clique em uma linha para explicação detalhada."
                : TABS.find((t) => t.id === activeTab)?.description}
            </p>

            {!hasConfig && (
              <button
                onClick={onOpenConfig}
                className="mb-4 px-4 py-2 rounded-lg text-xs border"
                style={{ borderColor: "#f0883e", color: "#f0883e", background: "rgba(240,136,62,0.1)" }}
              >
                ⚠️ Configurar LLM primeiro
              </button>
            )}

            {files.length === 0 && (
              <p className="mb-4 text-xs" style={{ color: "var(--editor-muted)" }}>Carregue um projeto primeiro</p>
            )}

            <button
              onClick={() => runAnalysis(activeTab)}
              disabled={files.length === 0 || !hasConfig}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
              style={{ background: "var(--editor-accent)", color: "white" }}
            >
              ▶ {getRunLabel(activeTab)}
            </button>

            {activeTab !== "explain" && filesUsed > 0 && (
              <p className="mt-3 text-xs" style={{ color: "var(--editor-muted)" }}>
                Analisará {filesUsed} de {files.length} arquivo{files.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Action bar */}
            <div
              className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0"
              style={{ borderColor: "var(--editor-border)" }}
            >
              <div className="flex items-center gap-2">
                {state.loading ? (
                  <>
                    <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--editor-accent)" }} />
                    <span className="text-xs" style={{ color: "var(--editor-accent)" }}>Analisando...</span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: "var(--editor-muted)" }}>
                    {state.error ? "⚠️ Erro" : "✓ Concluído"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigator.clipboard.writeText(state.content)}
                  title="Copiar tudo"
                  className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "var(--editor-muted)" }}
                >
                  📋
                </button>
                <button
                  onClick={() => setTabState(activeTab, { ...EMPTY_TAB })}
                  title="Limpar"
                  className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "var(--editor-muted)" }}
                >
                  ✕
                </button>
                <button
                  onClick={() => runAnalysis(activeTab)}
                  disabled={state.loading}
                  className="text-xs px-2.5 py-1 rounded font-medium transition-all disabled:opacity-40"
                  style={{ background: "rgba(56,139,253,0.2)", color: "var(--editor-accent)" }}
                >
                  ↺ Re-analisar
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              {state.error && (
                <div
                  className="mb-4 p-3 rounded-lg border text-sm"
                  style={{ borderColor: "#ff7b72", background: "rgba(255,123,114,0.1)", color: "#ff7b72" }}
                >
                  <strong>Erro:</strong> {state.error}
                  <button onClick={onOpenConfig} className="underline mt-1 block text-xs">
                    Verificar configuração do LLM
                  </button>
                </div>
              )}
              {state.content && <MarkdownRenderer content={state.content} />}
              {state.loading && !state.content && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--editor-muted)" }}>
                  <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--editor-muted)" }} />
                  Aguardando resposta...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
