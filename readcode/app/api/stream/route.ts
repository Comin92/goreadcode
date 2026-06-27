import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Message { role: "user" | "assistant" | "system"; content: string; }

interface StreamRequest {
  provider: "anthropic" | "openai" | "ollama" | "groq";
  model: string;
  apiKey?: string;
  baseUrl?: string;
  systemPrompt: string;
  userPrompt?: string;    // one-shot
  messages?: Message[];   // multi-turn chat
}

export async function POST(req: NextRequest) {
  let body: StreamRequest;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const { provider, model, apiKey, baseUrl, systemPrompt, userPrompt, messages } = body;

  if (!provider || !model || !systemPrompt) {
    return new Response(JSON.stringify({ error: "provider, model e systemPrompt são obrigatórios" }), { status: 400 });
  }
  if (provider !== "ollama" && !apiKey) {
    return new Response(JSON.stringify({ error: "apiKey obrigatória para " + provider }), { status: 400 });
  }
  if (!userPrompt && (!messages || messages.length === 0)) {
    return new Response(JSON.stringify({ error: "userPrompt ou messages obrigatório" }), { status: 400 });
  }

  // Normaliza para array de mensagens
  const msgList: Message[] = messages ?? [{ role: "user", content: userPrompt! }];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      const sendDone = () =>
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      const sendError = (err: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));

      try {
        if (provider === "anthropic") {
          await streamAnthropic({ model, apiKey: apiKey!, systemPrompt, messages: msgList }, send, sendDone, sendError);
        } else if (provider === "openai" || provider === "groq") {
          await streamOpenAI({ provider, model, apiKey: apiKey!, baseUrl, systemPrompt, messages: msgList }, send, sendDone, sendError);
        } else if (provider === "ollama") {
          await streamOllama({ model, baseUrl, systemPrompt, messages: msgList }, send, sendDone, sendError);
        } else {
          sendError("Provider não suportado: " + provider);
          sendDone();
        }
      } catch (err) {
        sendError(err instanceof Error ? err.message : String(err));
        sendDone();
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// ─── Anthropic ────────────────────────────────────────────────────────────────

async function streamAnthropic(
  opts: { model: string; apiKey: string; systemPrompt: string; messages: Message[] },
  onChunk: (t: string) => void, onDone: () => void, onError: (e: string) => void
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 8192,
      stream: true,
      system: opts.systemPrompt,
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    onError(`Anthropic ${res.status}: ${await res.text()}`);
    onDone();
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
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        if (json.type === "content_block_delta" && json.delta?.text) onChunk(json.delta.text);
      } catch {}
    }
  }
  onDone();
}

// ─── OpenAI / Groq ───────────────────────────────────────────────────────────

async function streamOpenAI(
  opts: { provider: string; model: string; apiKey: string; baseUrl?: string; systemPrompt: string; messages: Message[] },
  onChunk: (t: string) => void, onDone: () => void, onError: (e: string) => void
) {
  const baseUrl = opts.provider === "groq"
    ? "https://api.groq.com/openai/v1"
    : opts.baseUrl ?? "https://api.openai.com/v1";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      messages: [{ role: "system", content: opts.systemPrompt }, ...opts.messages],
    }),
  });

  if (!res.ok) {
    onError(`${opts.provider} ${res.status}: ${await res.text()}`);
    onDone();
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
      if (data === "[DONE]") continue;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {}
    }
  }
  onDone();
}

// ─── Ollama ───────────────────────────────────────────────────────────────────

async function streamOllama(
  opts: { model: string; baseUrl?: string; systemPrompt: string; messages: Message[] },
  onChunk: (t: string) => void, onDone: () => void, onError: (e: string) => void
) {
  const baseUrl = opts.baseUrl ?? "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      messages: [{ role: "system", content: opts.systemPrompt }, ...opts.messages],
    }),
  });

  if (!res.ok) { onError(`Ollama ${res.status}`); onDone(); return; }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split("\n").filter(Boolean)) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) onChunk(json.message.content);
        if (json.done) { onDone(); return; }
      } catch {}
    }
  }
  onDone();
}
