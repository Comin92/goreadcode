export type LLMProvider = "anthropic" | "openai" | "ollama" | "groq";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface FileTree {
  name: string;
  path: string;
  type: "file" | "folder";
  language?: string;
  children?: FileTree[];
}

export type AnalysisTab =
  | "overview"
  | "business-rules"
  | "dead-code"
  | "tests"
  | "explain"
  | "diagram"
  | "chat";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AnalysisResult {
  tab: AnalysisTab;
  content: string;
  loading: boolean;
  error?: string;
}

export interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
}

export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  anthropic: [
    "claude-opus-4-8",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
  ],
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ],
  ollama: [
    "llama3.1",
    "llama3.2",
    "codellama",
    "deepseek-coder",
    "qwen2.5-coder",
    "mistral",
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ],
};

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI",
  ollama: "Ollama (Local)",
  groq: "Groq",
};
