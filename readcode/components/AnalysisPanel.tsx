"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnalysisTab, ChatMessage, CodeFile, LLMConfig } from "@/types";
import { streamLLM, streamChat } from "@/lib/llm";
import {
  promptOverview, promptBusinessRules, promptDeadCode,
  promptTests, promptExplainLine, promptExplainFile,
  promptDiagram, SYSTEM_PROFESSOR,
} from "@/lib/prompts";
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(() => import("./MermaidDiagram"), { ssr: false });

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
  { id: "overview",        label: "Visão Geral",  icon: "🗺️", description: "Análise completa do projeto" },
  { id: "business-rules",  label: "Regras",        icon: "📋", description: "Extrai regras de negócio" },
  { id: "dead-code",       label: "Cód. Morto",    icon: "🧹", description: "Identifica código não utilizado" },
  { id: "tests",           label: "Testes",         icon: "🧪", description: "Estratégia e exemplos de testes" },
  { id: "explain",         label: "Explicar",       icon: "🎓", description: "Explique linha ou arquivo" },
  { id: "diagram",         label: "Diagrama",       icon: "🔀", description: "Diagrama de arquitetura Mermaid" },
  { id: "chat",            label: "Chat",           icon: "💬", description: "Pergunte qualquer coisa sobre o código" },
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

  const parts: Array<{ type: "text" | "code"; content: string; lang?: string; id: string }> = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0, m: RegExpExecArray | null, blockIdx = 0;

  while ((m = codeBlockRe.exec(content)) !== null) {
    if (m.index > lastIdx) parts.push({ type: "text", content: content.slice(lastIdx, m.index), id: `t${blockIdx++}` });
    parts.push({ type: "code", content: m[2].trimEnd(), lang: m[1] || undefined, id: `c${blockIdx++}` });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < content.length) parts.push({ type: "text", content: content.slice(lastIdx), id: `t${blockIdx++}` });

  const renderText = (raw: string): string => {
    const lines = raw.split("\n");
    const out: string[] = [];
    let inUl = false, inOl = false, inTable = false, tableHeader = false;
    const closeList = () => { if (inUl) { out.push("</ul>"); inUl = false; } if (inOl) { out.push("</ol>"); inOl = false; } };
    const closeTable = () => { if (inTable) { out.push("</tbody></table>"); inTable = false; tableHeader = false; } };

    for (const line of lines) {
      if (/^### (.+)/.test(line)) { closeList(); closeTable(); out.push(`<h3>${renderInline(line.replace(/^### /, ""))}</h3>`); continue; }
      if (/^## (.+)/.test(line))  { closeList(); closeTable(); out.push(`<h2>${renderInline(line.replace(/^## /, ""))}</h2>`); continue; }
      if (/^# (.+)/.test(line))   { closeList(); closeTable(); out.push(`<h1>${renderInline(line.replace(/^# /, ""))}</h1>`); continue; }
      if (/^---+$/.test(line.trim())) { closeList(); closeTable(); out.push("<hr>"); continue; }
      if (/^> (.+)/.test(line)) { closeList(); closeTable(); out.push(`<blockquote>${renderInline(line.replace(/^> /, ""))}</blockquote>`); continue; }

      if (/^\|.+\|$/.test(line)) {
        const cells = line.split("|").slice(1, -1).map((c) => c.trim());
        if (/^[\s|:-]+$/.test(line.replace(/[|:-]/g, ""))) { tableHeader = false; continue; }
        if (!inTable) { closeList(); out.push('<table><thead><tr>'); cells.forEach((c) => out.push(`<th>${renderInline(c)}</th>`)); out.push('</tr></thead><tbody>'); inTable = true; tableHeader = true; continue; }
        out.push('<tr>'); cells.forEach((c) => out.push(`<td>${renderInline(c)}</td>`)); out.push('</tr>'); continue;
      } else { closeTable(); }

      if (/^(\s*)[-*+] (.+)/.test(line)) { if (!inUl) { closeList(); out.push("<ul>"); inUl = true; } out.push(`<li>${renderInline(line.replace(/^\s*[-*+] /, ""))}</li>`); continue; }
      if (/^\d+\. (.+)/.test(line)) { if (!inOl) { closeList(); out.push("<ol>"); inOl = true; } out.push(`<li>${renderInline(line.replace(/^\d+\. /, ""))}</li>`); continue; }
      if (line.trim() === "") { closeList(); closeTable(); out.push("<br>"); continue; }
      closeList(); closeTable(); out.push(`<p>${renderInline(line)}</p>`);
    }
    closeList(); closeTable();
    return out.join("\n");
  };

  return (
    <div className="markdown-body">
      {parts.map((part) => {
        if (part.type === "code") {
          return (
            <div key={part.id} className="code-block-wrapper" style={{ position: "relative", margin: "12px 0" }}>
              {part.lang && (
                <span style={{ position: "absolute", top: 8, left: 12, fontSize: "10px", color: "var(--editor-muted)", textTransform: "uppercase" }}>
                  {part.lang}
                </span>
              )}
              <button
                onClick={() => copyCode(part.content, part.id)}
                style={{ position: "absolute", top: 6, right: 8, fontSize: "10px", padding: "2px 6px", borderRadius: 4, background: "rgba(56,139,253,0.15)", color: "var(--editor-accent)", border: "none", cursor: "pointer" }}
              >
                {copied === part.id ? "✓ Copiado" : "Copiar"}
              </button>
              <pre style={{ paddingTop: part.lang ? "28px" : "12px" }}><code>{part.content}</code></pre>
            </div>
          );
        }
        return <div key={part.id} dangerouslySetInnerHTML={{ __html: renderText(part.content) }} />;
      })}
    </div>
  );
}

// ─── Chat UI ─────────────────────────────────────────────────────────────────

function ChatTab({
  files, currentFile, llmConfig, onOpenConfig,
}: { files: CodeFile[]; currentFile: CodeFile | null; llmConfig: LLMConfig; onOpenConfig: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasConfig = !!(llmConfig.apiKey || llmConfig.provider === "ollama");

  // Auto-scroll ao receber chunks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildSystemPrompt = useCallback(() => {
    const fileList = files.slice(0, 15);
    const codeContext = fileList
      .map((f) => `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\``)
      .join("\n\n");
    return `${SYSTEM_PROFESSOR}

Você tem acesso ao seguinte projeto carregado pelo usuário (${files.length} arquivos no total, mostrando ${fileList.length}):

${codeContext}

Responda perguntas sobre este código de forma didática. Cite arquivos e linhas específicas quando relevante. Use Markdown.`;
  }, [files]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!hasConfig) { onOpenConfig(); return; }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);
    setStreamingId(assistantId);

    const historyForApi = [...messages, userMsg];
    const systemPrompt = buildSystemPrompt();

    await streamChat(llmConfig, systemPrompt, historyForApi, {
      onChunk: (text) => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: m.content + text } : m)
        );
      },
      onDone: () => {
        setLoading(false);
        setStreamingId(null);
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: `⚠️ Erro: ${err}` } : m)
        );
        setLoading(false);
        setStreamingId(null);
      },
    });
  }, [input, loading, messages, llmConfig, buildSystemPrompt, hasConfig, onOpenConfig]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const SUGGESTIONS = [
    "Como este projeto está estruturado?",
    "Quais são as principais funções do arquivo atual?",
    "Existe algum padrão de design sendo usado?",
    "Quais partes do código podem ser melhoradas?",
    "Como o fluxo de dados funciona neste projeto?",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0 text-xs"
        style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
      >
        <span>
          💬 Chat · {files.length} arquivo{files.length !== 1 ? "s" : ""} no contexto
          {currentFile && <span> · <span style={{ color: "var(--editor-accent)" }}>{currentFile.name}</span></span>}
        </span>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--editor-text)" }}>
              Pergunte sobre o código
            </p>
            <p className="text-xs mb-5 max-w-xs" style={{ color: "var(--editor-muted)" }}>
              {files.length === 0
                ? "Carregue um projeto primeiro."
                : `${files.length} arquivo${files.length !== 1 ? "s" : ""} carregado${files.length !== 1 ? "s" : ""}. Pode perguntar qualquer coisa!`}
            </p>
            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full max-w-xs">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-left text-xs px-3 py-2 rounded-lg border hover:bg-white/5 transition-colors"
                    style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[90%] rounded-xl px-3 py-2.5 text-sm"
              style={
                msg.role === "user"
                  ? { background: "var(--editor-accent)", color: "white", borderRadius: "16px 16px 4px 16px" }
                  : { background: "var(--editor-sidebar)", border: "1px solid var(--editor-border)", borderRadius: "4px 16px 16px 16px" }
              }
            >
              {msg.role === "assistant" ? (
                <div className="prose-sm">
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <span className="pulse-dot inline-block w-2 h-2 rounded-full" style={{ background: "var(--editor-muted)" }} />
                  )}
                  {streamingId === msg.id && msg.content && (
                    <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full ml-1" style={{ background: "var(--editor-accent)" }} />
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t p-2" style={{ borderColor: "var(--editor-border)" }}>
        {!hasConfig && (
          <button
            onClick={onOpenConfig}
            className="w-full mb-2 text-xs px-3 py-1.5 rounded-lg border text-center"
            style={{ borderColor: "#f0883e", color: "#f0883e", background: "rgba(240,136,62,0.08)" }}
          >
            ⚠️ Configure o LLM para usar o chat
          </button>
        )}
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: "var(--editor-border)", background: "var(--editor-sidebar)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={files.length === 0 ? "Carregue um projeto primeiro..." : "Pergunte sobre o código... (Enter para enviar, Shift+Enter para nova linha)"}
            disabled={loading || files.length === 0 || !hasConfig}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
            style={{
              color: "var(--editor-text)",
              maxHeight: 120,
              overflow: "auto",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || files.length === 0 || !hasConfig}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: "var(--editor-accent)", color: "white" }}
          >
            {loading ? (
              <span className="pulse-dot w-2 h-2 rounded-full bg-white" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-center mt-1 text-[10px]" style={{ color: "var(--editor-muted)" }}>
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalysisPanel({ files, currentFile, selectedLine, llmConfig, onOpenConfig }: Props) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [states, setStates] = useState<Record<Exclude<AnalysisTab, "chat">, TabState>>({
    overview:         { ...EMPTY_TAB },
    "business-rules": { ...EMPTY_TAB },
    "dead-code":      { ...EMPTY_TAB },
    tests:            { ...EMPTY_TAB },
    explain:          { ...EMPTY_TAB },
    diagram:          { ...EMPTY_TAB },
  });

  const explainCache = useRef<Map<string, TabState>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLineRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab !== "chat" && states[activeTab as Exclude<AnalysisTab, "chat">]?.loading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [states, activeTab]);

  const setTabState = useCallback((tab: Exclude<AnalysisTab, "chat">, update: Partial<TabState>) => {
    setStates((prev) => ({ ...prev, [tab]: { ...prev[tab], ...update } }));
  }, []);

  const runAnalysis = useCallback(async (tab: Exclude<AnalysisTab, "chat">) => {
    if (!llmConfig.apiKey && llmConfig.provider !== "ollama") { onOpenConfig(); return; }
    if (files.length === 0 && !currentFile) return;

    if (tab === "explain" && currentFile) {
      const key = `${currentFile.path}:${selectedLine ?? "file"}`;
      const cached = explainCache.current.get(key);
      if (cached?.ran && !cached.loading) { setTabState("explain", cached); return; }
    }

    setTabState(tab, { content: "", loading: true, error: undefined, ran: true });
    const fileSubset = files.slice(0, 20);

    const prompts: Record<Exclude<AnalysisTab, "chat">, () => string> = {
      overview:         () => promptOverview(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      "business-rules": () => promptBusinessRules(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      "dead-code":      () => promptDeadCode(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      tests:            () => promptTests(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      diagram:          () => promptDiagram(fileSubset.map((f) => ({ path: f.path, content: f.content }))),
      explain:          () => {
        if (selectedLine && currentFile) return promptExplainLine(currentFile.path, currentFile.content, selectedLine);
        if (currentFile) return promptExplainFile(currentFile.path, currentFile.content);
        return "";
      },
    };

    const userPrompt = prompts[tab]();
    if (!userPrompt) { setTabState(tab, { loading: false, ran: false, error: "Selecione um arquivo primeiro." }); return; }

    let accumulated = "";
    await streamLLM(llmConfig, SYSTEM_PROFESSOR, userPrompt, {
      onChunk: (text) => {
        accumulated += text;
        setStates((prev) => ({ ...prev, [tab]: { ...prev[tab], content: prev[tab].content + text } }));
      },
      onDone: () => {
        setTabState(tab, { loading: false });
        if (tab === "explain" && currentFile) {
          explainCache.current.set(`${currentFile.path}:${selectedLine ?? "file"}`, { content: accumulated, loading: false, ran: true });
        }
      },
      onError: (err) => setTabState(tab, { loading: false, error: err }),
    });
  }, [files, currentFile, selectedLine, llmConfig, onOpenConfig, setTabState]);

  useEffect(() => { if (selectedLine !== null) setActiveTab("explain"); }, [selectedLine]);

  useEffect(() => {
    if (activeTab === "explain" && selectedLine !== null && selectedLine !== prevLineRef.current && currentFile && (llmConfig.apiKey || llmConfig.provider === "ollama")) {
      prevLineRef.current = selectedLine;
      runAnalysis("explain");
    }
  }, [selectedLine, activeTab, currentFile, llmConfig, runAnalysis]);

  useEffect(() => {
    setTabState("explain", { ...EMPTY_TAB });
    prevLineRef.current = null;
  }, [currentFile?.path, setTabState]);

  const isChat = activeTab === "chat";
  const state = isChat ? EMPTY_TAB : states[activeTab as Exclude<AnalysisTab, "chat">];
  const hasConfig = !!(llmConfig.apiKey || llmConfig.provider === "ollama");
  const isDiagramReady = activeTab === "diagram" && state.ran && !state.loading && !state.error && state.content.length > 10;
  const filesUsed = Math.min(files.length, 20);

  const getRunLabel = (tab: AnalysisTab) => {
    if (tab === "explain" && selectedLine && currentFile) return `Explicar linha ${selectedLine} de ${currentFile.name}`;
    if (tab === "explain" && currentFile) return `Explicar ${currentFile.name}`;
    return TABS.find((t) => t.id === tab)?.description ?? "Analisar";
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--editor-panel)" }}>
      {/* Tab bar */}
      <div className="flex border-b overflow-x-auto flex-shrink-0 scrollbar-none" style={{ borderColor: "var(--editor-border)" }}>
        {TABS.map((tab) => {
          const tabState = tab.id === "chat" ? null : states[tab.id as Exclude<AnalysisTab, "chat">];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id ? "tab-active" : "tab-inactive"}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tabState?.loading && <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--editor-accent)" }} />}
              {tabState?.ran && !tabState.loading && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3fb950" }} />}
            </button>
          );
        })}
      </div>

      {/* Chat tab */}
      {isChat && (
        <ChatTab files={files} currentFile={currentFile} llmConfig={llmConfig} onOpenConfig={onOpenConfig} />
      )}

      {/* Analysis tabs */}
      {!isChat && (
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
                <button onClick={onOpenConfig} className="mb-4 px-4 py-2 rounded-lg text-xs border" style={{ borderColor: "#f0883e", color: "#f0883e", background: "rgba(240,136,62,0.1)" }}>
                  ⚠️ Configurar LLM primeiro
                </button>
              )}
              {files.length === 0 && <p className="mb-4 text-xs" style={{ color: "var(--editor-muted)" }}>Carregue um projeto primeiro</p>}
              <button
                onClick={() => runAnalysis(activeTab as Exclude<AnalysisTab, "chat">)}
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
              <div className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0" style={{ borderColor: "var(--editor-border)" }}>
                <div className="flex items-center gap-2">
                  {state.loading ? (
                    <><span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--editor-accent)" }} /><span className="text-xs" style={{ color: "var(--editor-accent)" }}>{activeTab === "diagram" ? "Gerando diagrama..." : "Analisando..."}</span></>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--editor-muted)" }}>{state.error ? "⚠️ Erro" : "✓ Concluído"}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {activeTab !== "diagram" && (
                    <button onClick={() => navigator.clipboard.writeText(state.content)} title="Copiar tudo" className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: "var(--editor-muted)" }}>📋</button>
                  )}
                  <button onClick={() => setTabState(activeTab as Exclude<AnalysisTab, "chat">, { ...EMPTY_TAB })} title="Limpar" className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: "var(--editor-muted)" }}>✕</button>
                  <button onClick={() => runAnalysis(activeTab as Exclude<AnalysisTab, "chat">)} disabled={state.loading} className="text-xs px-2.5 py-1 rounded font-medium transition-all disabled:opacity-40" style={{ background: "rgba(56,139,253,0.2)", color: "var(--editor-accent)" }}>↺ Re-analisar</button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                {state.error && (
                  <div className="mb-4 p-3 rounded-lg border text-sm" style={{ borderColor: "#ff7b72", background: "rgba(255,123,114,0.1)", color: "#ff7b72" }}>
                    <strong>Erro:</strong> {state.error}
                    <button onClick={onOpenConfig} className="underline mt-1 block text-xs">Verificar configuração do LLM</button>
                  </div>
                )}
                {activeTab === "diagram" && isDiagramReady && <MermaidDiagram chart={state.content} />}
                {activeTab === "diagram" && state.loading && state.content && (
                  <pre className="text-xs overflow-x-auto p-3 rounded-lg border" style={{ borderColor: "var(--editor-border)", background: "var(--editor-sidebar)", color: "var(--editor-muted)", whiteSpace: "pre-wrap" }}>{state.content}</pre>
                )}
                {activeTab !== "diagram" && state.content && <MarkdownRenderer content={state.content} />}
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
      )}
    </div>
  );
}
