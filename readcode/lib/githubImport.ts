import { CodeFile } from "@/types";
import { getLanguage } from "./fileParser";

const GITHUB_API = "https://api.github.com";
const MAX_FILE_SIZE = 200_000;
const MAX_FILES = 300;

const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
  ".mp4", ".mp3", ".wav", ".ogg", ".webm", ".avi", ".mov",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib", ".bin", ".DS_Store",
]);

const SKIP_PATHS = [
  "node_modules/", ".git/", ".next/", "dist/", "build/", "out/",
  "coverage/", "__pycache__/", ".cache/", "vendor/", ".venv/", "venv/",
  ".pytest_cache/", ".turbo/", ".vercel/",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.lock",
  "composer.lock", "Gemfile.lock",
];

const SKIP_SUFFIXES = [".min.js", ".min.css", ".map", "-lock.json"];

export interface RepoInfo {
  owner: string;
  repo: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
  url: string;
  topics: string[];
}

export interface ImportProgress {
  loaded: number;
  total: number;
  currentFile: string;
  phase: "meta" | "tree" | "files" | "done";
}

export type ProgressCallback = (p: ImportProgress) => void;

export interface GitHubImportOptions {
  token?: string;
  onProgress?: ProgressCallback;
}

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  const s = input.trim().replace(/\/$/, "");
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.replace(/^\//, "").split("/");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    }
  } catch {}
  const short = s.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (short) return { owner: short[1], repo: short[2] };
  return null;
}

function shouldSkipPath(path: string): boolean {
  const lower = path.toLowerCase();
  if (SKIP_PATHS.some((p) => lower.includes(p))) return true;
  if (SKIP_SUFFIXES.some((s) => lower.endsWith(s))) return true;
  const ext = path.includes(".") ? "." + path.split(".").pop()!.toLowerCase() : "";
  if (SKIP_EXTENSIONS.has(ext)) return true;
  return false;
}

async function ghFetch(url: string, token?: string): Promise<any> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.message ?? `HTTP ${res.status}`;
    if (res.status === 403) throw new Error(`Rate limit atingido. ${token ? "" : "Use um token GitHub para aumentar o limite."} (${msg})`);
    if (res.status === 404) throw new Error("Repositório não encontrado. Verifique se é público ou forneça um token.");
    throw new Error(`GitHub API: ${msg}`);
  }
  return res.json();
}

export async function importFromGitHub(
  urlOrSlug: string,
  options: GitHubImportOptions = {}
): Promise<{ files: CodeFile[]; repoInfo: RepoInfo }> {
  const { token, onProgress } = options;
  const parsed = parseGitHubUrl(urlOrSlug);
  if (!parsed) throw new Error("URL inválida. Exemplos: https://github.com/owner/repo  ou  owner/repo");

  const { owner, repo } = parsed;

  onProgress?.({ loaded: 0, total: 0, currentFile: "", phase: "meta" });
  const repoData = await ghFetch(`${GITHUB_API}/repos/${owner}/${repo}`, token);

  const repoInfo: RepoInfo = {
    owner, repo,
    description: repoData.description ?? "",
    stars: repoData.stargazers_count ?? 0,
    forks: repoData.forks_count ?? 0,
    language: repoData.language ?? "Unknown",
    defaultBranch: repoData.default_branch ?? "main",
    url: repoData.html_url,
    topics: repoData.topics ?? [],
  };

  onProgress?.({ loaded: 0, total: 0, currentFile: "", phase: "tree" });
  const treeData = await ghFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${repoInfo.defaultBranch}?recursive=1`,
    token
  );

  const blobs: Array<{ path: string; size: number }> = (treeData.tree ?? [])
    .filter((item: any) => item.type === "blob" && !shouldSkipPath(item.path) && (item.size ?? 0) <= MAX_FILE_SIZE)
    .slice(0, MAX_FILES);

  const total = blobs.length;
  const files: CodeFile[] = [];
  const BATCH_SIZE = 6;

  for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
    const batch = blobs.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (item) => {
        onProgress?.({ loaded: i, total, currentFile: item.path, phase: "files" });
        const data = await ghFetch(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(item.path)}?ref=${repoInfo.defaultBranch}`,
          token
        );
        const content = atob((data.content as string).replace(/\n/g, ""));
        const name = item.path.split("/").pop() ?? item.path;
        return { name, path: item.path, content, language: getLanguage(name), size: content.length } as CodeFile;
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") files.push(r.value);
    }
    if (i + BATCH_SIZE < blobs.length) await new Promise((r) => setTimeout(r, 120));
  }

  onProgress?.({ loaded: total, total, currentFile: "", phase: "done" });
  if (files.length === 0) throw new Error("Nenhum arquivo de código encontrado no repositório.");
  return { files, repoInfo };
}
