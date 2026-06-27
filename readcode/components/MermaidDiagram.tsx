"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  chart: string;
}

// Carrega mermaid via CDN (evita necessidade de npm install)
function loadMermaid(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).mermaid) {
      resolve((window as any).mermaid);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.onload = () => resolve((window as any).mermaid);
    script.onerror = () => reject(new Error("Falha ao carregar mermaid.js do CDN"));
    document.head.appendChild(script);
  });
}

// Extrai bloco mermaid de texto com markdown
function extractMermaidCode(raw: string): string {
  const match = raw.match(/```mermaid\n?([\s\S]*?)```/);
  if (match) return match[1].trim();
  // Se não tem fence, tenta usar o texto direto
  const trimmed = raw.trim();
  if (trimmed.startsWith("flowchart") || trimmed.startsWith("graph") || trimmed.startsWith("sequenceDiagram")) {
    return trimmed;
  }
  return raw.trim();
}

export default function MermaidDiagram({ chart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  const mermaidCode = extractMermaidCode(chart);

  const render = useCallback(async () => {
    if (!mermaidCode || !containerRef.current) return;
    setError(null);
    setRendered(false);

    try {
      const mermaid = await loadMermaid();
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#388bfd",
          primaryTextColor: "#e6edf3",
          primaryBorderColor: "#388bfd",
          lineColor: "#7d8590",
          secondaryColor: "#1c2128",
          tertiaryColor: "#161b22",
          background: "#0d1117",
          mainBkg: "#1c2128",
          nodeBorder: "#30363d",
          clusterBkg: "#161b22",
          clusterBorder: "#30363d",
          titleColor: "#e6edf3",
          edgeLabelBackground: "#161b22",
          fontFamily: "Inter, ui-sans-serif, sans-serif",
          fontSize: "13px",
        },
      });

      const id = `mermaid-render-${Date.now()}`;
      const { svg } = await mermaid.render(id, mermaidCode);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.width = "100%";
          svgEl.style.height = "auto";
          svgEl.removeAttribute("width");
          svgEl.removeAttribute("height");
        }
        setRendered(true);
      }
    } catch (err: any) {
      setError(err?.message ?? "Erro ao renderizar diagrama");
    }
  }, [mermaidCode]);

  useEffect(() => { render(); }, [render]);

  const handleCopySource = () => {
    navigator.clipboard.writeText("```mermaid\n" + mermaidCode + "\n```");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.innerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arquitetura.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const mermaidLiveUrl = `https://mermaid.live/edit#pako:${btoa(
    JSON.stringify({ code: mermaidCode, mermaid: { theme: "dark" } })
  ).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border overflow-hidden" style={{ borderColor: "var(--editor-border)" }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
            className="px-2 py-1 text-xs hover:bg-white/10 transition-colors"
            style={{ color: "var(--editor-muted)" }}
          >−</button>
          <span className="px-2 text-xs" style={{ color: "var(--editor-muted)", minWidth: 40, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="px-2 py-1 text-xs hover:bg-white/10 transition-colors"
            style={{ color: "var(--editor-muted)" }}
          >+</button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 text-xs hover:bg-white/10 transition-colors border-l"
            style={{ color: "var(--editor-muted)", borderColor: "var(--editor-border)" }}
          >↺</button>
        </div>

        <div className="flex-1" />

        <button
          onClick={handleCopySource}
          className="text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors"
          style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
        >
          {copied ? "✓ Copiado" : "📋 Copiar código"}
        </button>
        {rendered && (
          <button
            onClick={handleDownloadSVG}
            className="text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors"
            style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
          >
            ⬇ SVG
          </button>
        )}
        <a
          href="https://mermaid.live"
          target="_blank"
          rel="noopener"
          className="text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors"
          style={{ borderColor: "var(--editor-border)", color: "var(--editor-accent)" }}
        >
          ↗ Editor
        </a>
      </div>

      {/* Diagram canvas */}
      <div
        style={{
          overflow: "auto",
          background: "var(--editor-sidebar)",
          borderRadius: 8,
          border: "1px solid var(--editor-border)",
          padding: 16,
          minHeight: 180,
          cursor: "grab",
        }}
      >
        <div
          ref={containerRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease",
          }}
        />
        {!rendered && !error && (
          <div className="flex items-center justify-center py-10 gap-2 text-sm" style={{ color: "var(--editor-muted)" }}>
            <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--editor-muted)" }} />
            Renderizando diagrama...
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="space-y-2">
          <div
            className="p-3 rounded-lg border text-xs"
            style={{ borderColor: "#ff7b72", background: "rgba(255,123,114,0.08)", color: "#ff7b72" }}
          >
            ⚠️ {error} — tente re-gerar ou abra no editor online
          </div>
          <pre
            className="p-3 rounded-lg border text-xs overflow-x-auto"
            style={{ borderColor: "var(--editor-border)", background: "var(--editor-sidebar)", color: "var(--editor-muted)" }}
          >{mermaidCode}</pre>
        </div>
      )}

      {/* Source code (collapsible) */}
      {rendered && (
        <details className="text-xs">
          <summary className="cursor-pointer py-1" style={{ color: "var(--editor-muted)" }}>
            Ver código Mermaid
          </summary>
          <pre
            className="mt-2 p-3 rounded-lg border overflow-x-auto"
            style={{ borderColor: "var(--editor-border)", background: "var(--editor-sidebar)", color: "var(--editor-text)" }}
          >{mermaidCode}</pre>
        </details>
      )}
    </div>
  );
}
