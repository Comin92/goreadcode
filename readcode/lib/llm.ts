import { LLMConfig } from "@/types";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
) {
  try {
    if (config.provider === "anthropic") {
      await streamAnthropic(config, systemPrompt, userPrompt, callbacks);
    } else if (config.provider === "openai" || config.provider === "groq") {
      await streamOpenAICompatible(config, systemPrompt, userPrompt, callbacks);
    } else if (config.provider === "ollama") {
      await streamOllama(config, systemPrompt, userPrompt, callbacks);
    }
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : String(err));
  }
}

async function streamAnthropic(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-beta": "messages-2023-12-15",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 8192,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
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
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          if (json.type === "content_block_delta" && json.delta?.text) {
            callbacks.onChunk(json.delta.text);
          }
        } catch {}
      }
    }
  }
  callbacks.onDone();
}

async function streamOpenAICompatible(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
) {
  const baseUrl =
    config.provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : config.baseUrl ?? "https://api.openai.com/v1";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} ${err}`);
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
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) callbacks.onChunk(delta);
        } catch {}
      }
    }
  }
  callbacks.onDone();
}

async function streamOllama(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
) {
  const baseUrl = config.baseUrl ?? "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) callbacks.onChunk(json.message.content);
        if (json.done) callbacks.onDone();
      } catch {}
    }
  }
}
