"use client";

import { useState, useCallback, useEffect } from "react";
import { CodeFile, FileTree, LLMConfig } from "@/types";
import { buildFileTree, formatFileSize } from "@/lib/fileParser";
import { RepoInfo } from "@/lib/githubImport";
import UploadZone from "@/components/UploadZone";
import FileTreeComponent from "@/components/FileTree";
import CodeViewer from "@/components/CodeViewer";
import AnalysisPanel from "@/components/AnalysisPanel";
import LLMConfigModal from "@/components/LLMConfig";

const DEFAULT_CONFIG: LLMConfig = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-6",
};

const STORAGE_KEY = "readcode_llm_config";

function loadConfig(): LLMConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: LLMConfig) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
}

export default function HomePage() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [fileTree, setFileTree] = useState<FileTree[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(480);
  const [isDraggingPanel, setIsDraggingPanel] = useState<"sidebar" | "analysis" | null>(null);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  useEffect(() => { setLlmConfig(loadConfig()); }, []);

  const handleFilesLoaded = useCallback((newFiles: CodeFile[], info?: RepoInfo) => {
    setFiles(newFiles);
    setFileTree(buildFileTree(newFiles));
    setRepoInfo(info ?? null);
    if (newFiles.length > 0) {
      setSelectedPath(newFiles[0].path);
      setSelectedLine(null);
    }
  }, []);

  const handleSelectFile = useCallback((path: string) => {
    setSelectedPath(path);
    setSelectedLine(null);
  }, []);

  const handleLineClick = useCallback((lineNumber: number) => {
    setSelectedLine((prev) => (prev === lineNumber ? null : lineNumber));
  }, []);

  const handleConfigChange = useCallback((config: LLMConfig) => {
    setLlmConfig(config);
    saveConfig(config);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setFileTree([]);
    setSelectedPath("");
    setSelectedLine(null);
    setRepoInfo(null);
  }, []);

  const currentFile = files.find((f) => f.path === selectedPath) ?? null;
  const hasFiles = files.length > 0;
  const configOk = llmConfig.apiKey || llmConfig.provider === "ollama";

  const startResize = useCallback((panel: "sidebar" | "analysis") => {
    setIsDraggingPanel(panel);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }, []);

  useEffect(() => {
    if (!isDraggingPanel) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPanel === "sidebar") {
        setSidebarWidth(Math.max(160, Math.min(400, e.clientX)));
      } else {
        setAnalysisPanelWidth(Math.max(300, Math.min(700, window.innerWidth - e.clientX)));
      }
    };
    const handleMouseUp = () => {
      setIsDraggingPanel(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPanel]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--editor-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 h-11 border-b flex-shrink-0"
        style={{ background: "var(--editor-sidebar)", borderColor: "var(--editor-border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📖</span>
          <span className="font-bold text-sm" style={{ color: "var(--editor-text)" }}>ReadCode</span>
          {repoInfo ? (
            <a
              href={repoInfo.url}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full hover:bg-white/5 transition-colors"
              style={{ background: "rgba(56,139,253,0.15)", color: "var(--editor-accent)" }}
            >
              🐙 {repoInfo.owner}/{repoInfo.repo}
              {repoInfo.stars > 0 && (
                <span style={{ color: "var(--editor-muted)" }}>
                  &nbsp;⭐ {repoInfo.stars.toLocaleString()}
                </span>
              )}
            </a>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(56,139,253,0.2)", color: "var(--editor-accent)" }}>
              Professor de Código
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasFiles && (
            <span className="text-xs" style={{ color: "var(--editor-muted)" }}>
              {files.length} arquivo{files.length !== 1 ? "s" : ""} carregado{files.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium transition-all hover:bg-white/5"
            style={{
              borderColor: configOk ? "rgba(56,139,253,0.4)" : "var(--editor-border)",
              color: configOk ? "var(--editor-accent)" : "var(--editor-muted)",
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${configOk ? "bg-green-400" : "bg-yellow-400"}`} />
            {configOk ? llmConfig.model : "Configurar LLM"}
          </button>
        </div>
      </header>

      {/* Main */}
      {!hasFiles ? (
        <div className="flex-1 overflow-hidden">
          <UploadZone onFilesLoaded={handleFilesLoaded} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="flex-shrink-0 border-r overflow-hidden"
            style={{ width: sidebarWidth, borderColor: "var(--editor-border)", background: "var(--editor-sidebar)" }}
          >
            <FileTreeComponent
              tree={fileTree}
              selectedPath={selectedPath}
              onSelect={handleSelectFile}
              totalFiles={files.length}
              repoInfo={repoInfo}
              onClear={handleClear}
            />
          </div>

          <div
            className="w-1 cursor-col-resize flex-shrink-0 hover:bg-blue-500/40 transition-colors"
            style={{ background: isDraggingPanel === "sidebar" ? "rgba(56,139,253,0.5)" : "transparent" }}
            onMouseDown={() => startResize("sidebar")}
          />

          {/* Code viewer */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0">
            {currentFile && (
              <div
                className="flex items-center justify-between px-4 h-9 border-b flex-shrink-0"
                style={{ borderColor: "var(--editor-border)", background: "var(--editor-panel)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-code truncate" style={{ color: "var(--editor-muted)" }}>
                    {currentFile.path}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--editor-muted)" }}>
                    · {currentFile.language} · {formatFileSize(currentFile.size)}
                  </span>
                </div>
                {selectedLine && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(56,139,253,0.2)", color: "var(--editor-accent)" }}>
                      Linha {selectedLine} selecionada
                    </span>
                    <button onClick={() => setSelectedLine(null)} className="text-xs" style={{ color: "var(--editor-muted)" }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
            {currentFile ? (
              <div className="flex-1 overflow-hidden">
                <CodeViewer file={currentFile} selectedLine={selectedLine} onLineClick={handleLineClick} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: "var(--editor-muted)" }}>Selecione um arquivo para visualizar</p>
              </div>
            )}
          </div>

          <div
            className="w-1 cursor-col-resize flex-shrink-0 hover:bg-blue-500/40 transition-colors"
            style={{ background: isDraggingPanel === "analysis" ? "rgba(56,139,253,0.5)" : "transparent" }}
            onMouseDown={() => startResize("analysis")}
          />

          {/* Analysis panel */}
          <div
            className="flex-shrink-0 border-l overflow-hidden"
            style={{ width: analysisPanelWidth, borderColor: "var(--editor-border)" }}
          >
            <AnalysisPanel
              files={files}
              currentFile={currentFile}
              selectedLine={selectedLine}
              llmConfig={llmConfig}
              onOpenConfig={() => setShowConfig(true)}
            />
          </div>
        </div>
      )}

      {showConfig && (
        <LLMConfigModal config={llmConfig} onChange={handleConfigChange} onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
}
