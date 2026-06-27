"use client";

import { useMemo, useRef, useEffect } from "react";
import { CodeFile } from "@/types";
import { highlightCode } from "@/lib/syntaxHighlight";

interface Props {
  file: CodeFile;
  selectedLine: number | null;
  onLineClick: (lineNumber: number) => void;
  highlightedLines?: number[];
}

export default function CodeViewer({ file, selectedLine, onLineClick, highlightedLines = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => file.content.split("\n"), [file.content]);
  const highlighted = useMemo(
    () => highlightCode(file.content, file.language),
    [file.content, file.language]
  );
  const highlightedLines_ = useMemo(() => highlighted.split("\n"), [highlighted]);

  useEffect(() => {
    if (selectedLine && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-line="${selectedLine}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedLine]);

  const totalLines = lines.length;
  const lineNumWidth = String(totalLines).length;

  return (
    <div ref={containerRef} className="h-full overflow-auto" style={{ background: "var(--editor-bg)" }}>
      <div className="font-code text-sm select-text">
        {lines.map((rawLine, i) => {
          const lineNum = i + 1;
          const isSelected = selectedLine === lineNum;
          const isHighlighted = highlightedLines.includes(lineNum);

          return (
            <div
              key={lineNum}
              data-line={lineNum}
              onClick={() => onLineClick(lineNum)}
              className={`code-line flex ${isSelected ? "selected" : ""}`}
              style={{
                background: isSelected
                  ? "rgba(38, 79, 120, 0.5)"
                  : isHighlighted
                  ? "rgba(255, 123, 114, 0.1)"
                  : undefined,
                borderLeftColor: isSelected ? "var(--editor-accent)" : isHighlighted ? "#ff7b72" : "transparent",
              }}
            >
              {/* Line number */}
              <span
                className="select-none flex-shrink-0 text-right pr-4 pl-3"
                style={{
                  color: isSelected ? "var(--editor-accent)" : "var(--editor-muted)",
                  minWidth: `${lineNumWidth + 3}ch`,
                  fontSize: "11px",
                  lineHeight: "inherit",
                  userSelect: "none",
                }}
              >
                {lineNum}
              </span>

              {/* Code */}
              <span
                className="flex-1 pr-8 whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightedLines_[i] ?? "" }}
              />

              {/* Click hint */}
              {isSelected && (
                <span
                  className="flex-shrink-0 pr-2 text-xs flex items-center"
                  style={{ color: "var(--editor-accent)", opacity: 0.7, fontSize: "10px" }}
                >
                  ← explicar
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
