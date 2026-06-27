import { LLMConfig, ChatMessage } from "@/types";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Análise one-shot: envia systemPrompt + userPrompt para /api/stream
 */
export async function streamLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
) {
  await _stream(
    { provider: config.provider, model: config.model, apiKey: config.apiKey, baseUrl: config.baseUrl, systemPrompt, userPrompt },
    callbacks
  );
}

/**
 * Chat multi-turn: envia histórico de mensagens para /api/stream
 */
export async function streamChat(
  config: LLMConfig,
  systemPrompt: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks
) {
  await _stream(
    {
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    },
    callbacks
  );
}

async function _stream(body: Record<string, unknown>, callbacks: StreamCallbacks) {
  try {
    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      let msg = `Erro HTTP ${res.status}`;
      try { msg = JSON.parse(txt).error ?? msg; } catch {}
      callbacks.onError(msg);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") { callbacks.onDone(); return; }
        try {
          const json = JSON.parse(data);
          if (json.error) { callbacks.onError(json.error); return; }
          if (json.text) callbacks.onChunk(json.text);
        } catch {}
      }
    }
    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : String(err));
  }
}
