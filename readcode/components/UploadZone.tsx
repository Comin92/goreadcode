"use client";

import { useRef, useState, useCallback } from "react";
import { CodeFile } from "@/types";
import { parseDroppedItems, parseFileList, parseCodePaste, getLanguage } from "@/lib/fileParser";
import { importFromGitHub, parseGitHubUrl, RepoInfo, ImportProgress } from "@/lib/githubImport";

interface Props {
  onFilesLoaded: (files: CodeFile[], repoInfo?: RepoInfo) => void;
}

type InputMode = "drop" | "github" | "paste" | "path";

const MODE_LABELS: Record<InputMode, string> = {
  drop: "📁 Arquivos",
  github: "🐙 GitHub",
  paste: "📋 Colar",
  path: "🔗 Caminho",
};

export default function UploadZone({ onFilesLoaded }: Props) {
  const [mode, setMode] = useState<InputMode>("drop");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pasteCode, setPasteCode] = useState("");
  const [pasteName, setPasteName] = useState("main.ts");
  const [error, setError] = useState("");

  // GitHub state
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      setLoading(true);
      setError("");
      try {
        const files = await parseDroppedItems(e.dataTransfer.items);
        if (files.length === 0) throw new Error("Nenhum arquivo de código encontrado.");
        onFilesLoaded(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [onFilesLoaded]
  );

  // File input
  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      setLoading(true);
      setError("");
      try {
        const fileArr = Array.from(e.target.files);
        const zipFile = fileArr.find((f) => f.name.endsWith(".zip"));
        if (zipFile) {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(zipFile);
          const files: CodeFile[] = [];
          for (const [path, entry] of Object.entries(zip.files)) {
            if (entry.dir) continue;
            if (
              path.includes("node_modules") || path.includes(".git") ||
              path.includes(".next") || path.endsWith(".min.js") ||
              path.endsWith("package-lock.json")
            ) continue;
            const content = await entry.async("text");
            const name = path.split("/").pop() ?? path;
            files.push({ name, path, content, language: getLanguage(name), size: content.length });
          }
          onFilesLoaded(files);
        } else {
          const files = await parseFileList(e.target.files);
          onFilesLoaded(files);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    },
    [onFilesLoaded]
  );

  // Paste
  const handlePaste = useCallback(() => {
    if (!pasteCode.trim()) { setError("Cole algum código primeiro."); return; }
    onFilesLoaded([parseCodePaste(pasteCode, pasteName || "code.txt")]);
  }, [pasteCode, pasteName, onFilesLoaded]);

  // GitHub Import
  const handleGitHubImport = useCallback(async () => {
    if (!githubUrl.trim()) { setError("Cole a URL do repositório."); return; }
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) { setError("URL inválida. Ex: https://github.com/facebook/react"); return; }

    setLoading(true);
    setError("");
    setProgress(null);

    try {
      const { files, repoInfo } = await importFromGitHub(githubUrl, {
        token: githubToken || undefined,
        onProgress: setProgress,
      });
      onFilesLoaded(files, repoInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
      setProgress(null);
    }
  }, [githubUrl, githubToken, onFilesLoaded]);

  function progressLabel(p: ImportProgress): string {
    if (p.phase === "meta") return "Lendo informações do repositório...";
    if (p.phase === "tree") return "Mapeando estrutura de arquivos...";
    if (p.phase === "done") return "Concluído!";
    const pct = p.total > 0 ? Math.round((p.loaded / p.total) * 100) : 0;
    return `Baixando arquivos... ${pct}%${p.currentFile ? ` — ${p.currentFile.split("/").pop()}` : ""}`;
  }

  return (
    <div className="flex flex-col h-full items-center justify-center p-8" style={{ background: "var(--editor-bg)" }}>
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">📖</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--editor-text)" }}>ReadCode</h1>
          <p className="text-base" style={{ color: "var(--editor-muted)" }}>
            Seu professor particular de código — análise, explica e ensina qualquer projeto
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg p-1 mb-6" style={{ background: "var(--editor-sidebar)" }}>
          {(["drop", "github", "paste", "path"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                background: mode === m ? "var(--editor-panel)" : "transparent",
                color: mode === m ? "var(--editor-text)" : "var(--editor-muted)",
                border: mode === m ? "1px solid var(--editor-border)" : "1px solid transparent",
              }}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        {mode === "drop" && (
          <div
            className={`drop-zone rounded-xl p-10 text-center cursor-pointer transition-all ${dragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept="*" className="hidden" onChange={handleFileInput} />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-3xl pulse-dot">⚙️</div>
                <p style={{ color: "var(--editor-muted)" }}>Processando arquivos...</p>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">{dragging ? "📂" : "📁"}</div>
                <p className="text-base font-medium mb-2" style={{ color: "var(--editor-text)" }}>
                  {dragging ? "Solte aqui!" : "Arraste arquivos, pastas ou um .zip"}
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--editor-muted)" }}>ou clique para selecionar</p>
                <div className="flex justify-center gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Selecionar Arquivos
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const inp = document.createElement("input");
                      inp.type = "file";
                      // @ts-ignore
                      inp.webkitdirectory = true;
                      inp.multiple = true;
                      inp.onchange = (ev) => handleFileInput(ev as any);
                      inp.click();
                    }}
                  >
                    Selecionar Pasta
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* GitHub Import */}
        {mode === "github" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--editor-muted)" }}>
                URL do repositório GitHub
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleGitHubImport()}
                placeholder="https://github.com/owner/repo"
                disabled={loading}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-code"
                style={{
                  background: "var(--editor-sidebar)",
                  borderColor: "var(--editor-border)",
                  color: "var(--editor-text)",
                }}
              />
            </div>

            <div>
              <button
                className="text-xs flex items-center gap-1 mb-1.5"
                style={{ color: "var(--editor-muted)" }}
                onClick={() => setShowToken(!showToken)}
              >
                <span>{showToken ? "▼" : "▶"}</span>
                Token GitHub (opcional — aumenta rate limit e permite repos privados)
              </button>
              {showToken && (
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-code"
                  style={{
                    background: "var(--editor-sidebar)",
                    borderColor: "var(--editor-border)",
                    color: "var(--editor-text)",
                  }}
                />
              )}
            </div>

            {loading && progress && (
              <div className="space-y-2">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--editor-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      background: "var(--editor-accent)",
                      width: progress.total > 0
                        ? `${Math.round((progress.loaded / progress.total) * 100)}%`
                        : "15%",
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--editor-muted)" }}>
                  {progressLabel(progress)}
                </p>
              </div>
            )}

            <button
              onClick={handleGitHubImport}
              disabled={loading || !githubUrl.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{ background: "var(--editor-accent)", color: "white" }}
            >
              {loading ? "⏳ Importando..." : "🐙 Importar Repositório"}
            </button>

            <div className="p-3 rounded-lg border text-xs leading-relaxed" style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}>
              <strong style={{ color: "var(--editor-text)" }}>Sem token:</strong> 60 req/hora (repos pequenos OK) &nbsp;·&nbsp;
              <strong style={{ color: "var(--editor-text)" }}>Com token:</strong> 5.000/hora + privados &nbsp;
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" style={{ color: "var(--editor-accent)" }}>
                → Criar token
              </a>
            </div>

            <div>
              <p className="text-xs mb-2" style={{ color: "var(--editor-muted)" }}>Exemplos rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {["Comin92/goreadcode", "vercel/next.js", "facebook/react", "microsoft/vscode"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setGithubUrl(`https://github.com/${ex}`)}
                    className="text-xs px-2.5 py-1 rounded-full border hover:bg-white/5"
                    style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paste */}
        {mode === "paste" && (
          <div className="space-y-3">
            <input
              type="text"
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
              placeholder="nome-do-arquivo.ts"
              className="w-full px-3 py-2 rounded-lg border text-sm font-code"
              style={{ background: "var(--editor-sidebar)", borderColor: "var(--editor-border)", color: "var(--editor-text)" }}
            />
            <textarea
              value={pasteCode}
              onChange={(e) => setPasteCode(e.target.value)}
              placeholder="Cole seu código aqui..."
              rows={14}
              className="w-full px-4 py-3 rounded-xl border text-sm font-code resize-none"
              style={{ background: "var(--editor-sidebar)", borderColor: "var(--editor-border)", color: "var(--editor-text)" }}
            />
            <button
              onClick={handlePaste}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "var(--editor-accent)", color: "white" }}
            >
              ▶ Analisar Código
            </button>
          </div>
        )}

        {/* Path */}
        {mode === "path" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border" style={{ borderColor: "var(--editor-border)", background: "var(--editor-sidebar)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--editor-text)" }}>Como usar o modo Caminho</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--editor-muted)" }}>
                1. Selecione a pasta do projeto no painel<br />
                2. Cole o código via modo &quot;Colar&quot;<br />
                3. Ou use o modo de arrastar pasta acima
              </p>
            </div>
            <button
              onClick={() => setMode("drop")}
              className="w-full py-3 rounded-xl font-semibold text-sm border"
              style={{ borderColor: "var(--editor-accent)", color: "var(--editor-accent)" }}
            >
              ← Ir para Arrastar Pasta
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg border text-sm" style={{ borderColor: "#ff7b72", background: "rgba(255,123,114,0.1)", color: "#ff7b72" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["🗺️ Visão Geral", "📋 Regras de Negócio", "🧹 Código Morto", "🧪 Geração de Testes", "🎓 Explicação Linha a Linha"].map((f) => (
            <span key={f} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
