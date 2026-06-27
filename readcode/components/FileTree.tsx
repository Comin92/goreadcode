"use client";

import { useState } from "react";
import { FileTree as FileTreeType } from "@/types";
import { formatFileSize } from "@/lib/fileParser";
import { RepoInfo } from "@/lib/githubImport";

const FILE_ICONS: Record<string, string> = {
  typescript: "🔷", javascript: "🟡", python: "🐍", rust: "🦀",
  go: "🐹", java: "☕", css: "🎨", html: "🌐", json: "📋",
  yaml: "⚙️", markdown: "📝", sql: "🗄️", bash: "💻",
  dockerfile: "🐳", vue: "💚", svelte: "🔥", kotlin: "🟣",
  swift: "🍎", graphql: "◈", plaintext: "📄",
};

function getFileIcon(language?: string): string {
  return FILE_ICONS[language ?? ""] ?? "📄";
}

// ─── Repo Info Card ───────────────────────────────────────────────────────────

function RepoInfoCard({ info }: { info: RepoInfo }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b" style={{ borderColor: "var(--editor-border)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
        style={{ color: "var(--editor-muted)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🐙</span>
          <span className="text-xs font-semibold truncate" style={{ color: "var(--editor-text)" }}>
            {info.owner}/{info.repo}
          </span>
        </div>
        <span className="text-xs flex-shrink-0">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {info.description && (
            <p className="text-xs leading-relaxed" style={{ color: "var(--editor-muted)" }}>
              {info.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--editor-muted)" }}>
            {info.language && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--editor-accent)" }} />
                {info.language}
              </span>
            )}
            {info.stars > 0 && <span>⭐ {info.stars.toLocaleString()}</span>}
            {info.forks > 0 && <span>🍴 {info.forks.toLocaleString()}</span>}
          </div>

          {/* Topics */}
          {info.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {info.topics.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(56,139,253,0.12)", color: "var(--editor-accent)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <a
            href={info.url}
            target="_blank"
            rel="noopener"
            className="text-xs block hover:underline"
            style={{ color: "var(--editor-accent)" }}
          >
            → Abrir no GitHub
          </a>
        </div>
      )}
    </div>
  );
}

// ─── File Tree Node ───────────────────────────────────────────────────────────

interface FileTreeNodeProps {
  node: FileTreeType;
  selectedPath: string;
  onSelect: (path: string) => void;
  depth: number;
}

function FileTreeNode({ node, selectedPath, onSelect, depth }: FileTreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center w-full px-2 py-0.5 text-left text-xs hover:bg-white/5 rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px`, color: "var(--editor-muted)" }}
        >
          <span className="mr-1">{open ? "▾" : "▸"}</span>
          <span className="mr-1.5">📁</span>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {open && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} selectedPath={selectedPath} onSelect={onSelect} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;

  return (
    <button
      onClick={() => onSelect(node.path)}
      className="flex items-center w-full px-2 py-0.5 text-left text-xs rounded transition-all"
      style={{
        paddingLeft: `${depth * 12 + 8}px`,
        background: isSelected ? "rgba(56,139,253,0.15)" : "transparent",
        color: isSelected ? "var(--editor-accent)" : "var(--editor-text)",
      }}
    >
      <span className="mr-1.5">{getFileIcon(node.language)}</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ─── FileTree root ────────────────────────────────────────────────────────────

interface Props {
  tree: FileTreeType[];
  selectedPath: string;
  onSelect: (path: string) => void;
  totalFiles: number;
  onClear: () => void;
  repoInfo?: RepoInfo | null;
}

export default function FileTree({ tree, selectedPath, onSelect, totalFiles, onClear, repoInfo }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Repo info card (GitHub only) */}
      {repoInfo && <RepoInfoCard info={repoInfo} />}

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: "var(--editor-border)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--editor-muted)" }}>
          Arquivos ({totalFiles})
        </span>
        <button
          onClick={onClear}
          className="text-xs px-2 py-0.5 rounded hover:bg-red-500/20 transition-colors"
          style={{ color: "var(--editor-muted)" }}
          title="Fechar projeto"
        >
          ✕ Fechar
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <FileTreeNode key={node.path} node={node} selectedPath={selectedPath} onSelect={onSelect} depth={0} />
        ))}
      </div>
    </div>
  );
}
