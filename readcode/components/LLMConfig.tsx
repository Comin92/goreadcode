"use client";

import { useState, useEffect } from "react";
import { LLMConfig as LLMConfigType, LLMProvider, PROVIDER_LABELS, PROVIDER_MODELS } from "@/types";

interface Props {
  config: LLMConfigType;
  onChange: (config: LLMConfigType) => void;
  onClose: () => void;
}

export default function LLMConfig({ config, onChange, onClose }: Props) {
  const [local, setLocal] = useState<LLMConfigType>(config);

  const handleSave = () => {
    onChange(local);
    onClose();
  };

  const providers: LLMProvider[] = ["anthropic", "openai", "groq", "ollama"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="fade-in rounded-xl border p-6 w-full max-w-md" style={{ background: "var(--editor-panel)", borderColor: "var(--editor-border)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--editor-text)" }}>
            ⚙️ Configuração do LLM
          </h2>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: "var(--editor-muted)" }}>✕</button>
        </div>

        {/* Provider */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--editor-muted)" }}>Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setLocal({
                    ...local,
                    provider: p,
                    model: PROVIDER_MODELS[p][0],
                    apiKey: p === "ollama" ? "" : local.apiKey,
                  })
                }
                className="p-2 rounded-lg border text-sm font-medium transition-all"
                style={{
                  background: local.provider === p ? "rgba(56,139,253,0.2)" : "transparent",
                  borderColor: local.provider === p ? "var(--editor-accent)" : "var(--editor-border)",
                  color: local.provider === p ? "var(--editor-accent)" : "var(--editor-muted)",
                }}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--editor-muted)" }}>Modelo</label>
          <select
            value={local.model}
            onChange={(e) => setLocal({ ...local, model: e.target.value })}
            className="w-full p-2 rounded-lg border text-sm"
            style={{
              background: "var(--editor-sidebar)",
              borderColor: "var(--editor-border)",
              color: "var(--editor-text)",
            }}
          >
            {PROVIDER_MODELS[local.provider].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* API Key */}
        {local.provider !== "ollama" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--editor-muted)" }}>
              API Key{" "}
              <a
                href={
                  local.provider === "anthropic"
                    ? "https://console.anthropic.com/keys"
                    : local.provider === "openai"
                    ? "https://platform.openai.com/api-keys"
                    : "https://console.groq.com/keys"
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs underline"
                style={{ color: "var(--editor-accent)" }}
              >
                Obter chave ↗
              </a>
            </label>
            <input
              type="password"
              value={local.apiKey}
              onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
              placeholder={`sk-...`}
              className="w-full p-2 rounded-lg border text-sm font-code"
              style={{
                background: "var(--editor-sidebar)",
                borderColor: "var(--editor-border)",
                color: "var(--editor-text)",
              }}
            />
          </div>
        )}

        {/* Ollama URL */}
        {local.provider === "ollama" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--editor-muted)" }}>
              URL do Ollama
            </label>
            <input
              type="text"
              value={local.baseUrl ?? "http://localhost:11434"}
              onChange={(e) => setLocal({ ...local, baseUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full p-2 rounded-lg border text-sm font-code"
              style={{
                background: "var(--editor-sidebar)",
                borderColor: "var(--editor-border)",
                color: "var(--editor-text)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--editor-muted)" }}>
              Certifique-se que o Ollama está rodando localmente com o modelo instalado.
            </p>
          </div>
        )}

        {/* Custom model input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--editor-muted)" }}>
            Ou digite um modelo customizado
          </label>
          <input
            type="text"
            value={local.model}
            onChange={(e) => setLocal({ ...local, model: e.target.value })}
            className="w-full p-2 rounded-lg border text-sm font-code"
            style={{
              background: "var(--editor-sidebar)",
              borderColor: "var(--editor-border)",
              color: "var(--editor-text)",
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: "var(--editor-border)", color: "var(--editor-muted)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--editor-accent)", color: "white" }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
