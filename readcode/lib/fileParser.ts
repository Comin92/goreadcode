import { CodeFile, FileTree } from "@/types";

const LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  swift: "swift",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
  vue: "vue",
  svelte: "svelte",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  dockerfile: "dockerfile",
  toml: "toml",
  xml: "xml",
  graphql: "graphql",
  gql: "graphql",
  env: "plaintext",
  txt: "plaintext",
};

const SKIP_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  "__pycache__",
  ".pytest_cache",
  "vendor",
  ".venv",
  "venv",
  ".DS_Store",
  "*.min.js",
  "*.min.css",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

export function shouldSkipPath(path: string): boolean {
  return SKIP_PATTERNS.some((pattern) => {
    if (pattern.startsWith("*")) {
      return path.endsWith(pattern.slice(1));
    }
    return path.includes(pattern);
  });
}

export function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const base = filename.toLowerCase();
  if (base === "dockerfile") return "dockerfile";
  if (base === "makefile") return "makefile";
  return LANGUAGE_MAP[ext] ?? "plaintext";
}

export function buildFileTree(files: CodeFile[]): FileTree[] {
  const root: FileTree[] = [];
  const map: Record<string, FileTree> = {};

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const folderPath = parts.slice(0, i + 1).join("/");
      if (!map[folderPath]) {
        const folder: FileTree = {
          name: parts[i],
          path: folderPath,
          type: "folder",
          children: [],
        };
        map[folderPath] = folder;
        current.push(folder);
      }
      current = map[folderPath].children!;
    }

    const leaf: FileTree = {
      name: parts[parts.length - 1],
      path: file.path,
      type: "file",
      language: file.language,
    };
    current.push(leaf);
  }

  return root;
}

export async function parseDroppedItems(items: DataTransferItemList): Promise<CodeFile[]> {
  const files: CodeFile[] = [];

  async function processEntry(entry: FileSystemEntry, basePath: string = "") {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) =>
        fileEntry.file(resolve, reject)
      );

      const path = basePath ? `${basePath}/${entry.name}` : entry.name;
      if (shouldSkipPath(path)) return;

      const content = await file.text();
      files.push({
        name: entry.name,
        path,
        content,
        language: getLanguage(entry.name),
        size: file.size,
      });
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const path = basePath ? `${basePath}/${entry.name}` : entry.name;
      if (shouldSkipPath(path)) return;

      const reader = dirEntry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject)
      );

      for (const childEntry of entries) {
        await processEntry(childEntry, path);
      }
    }
  }

  const entryPromises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      entryPromises.push(processEntry(entry));
    }
  }

  await Promise.all(entryPromises);
  return files;
}

export async function parseFileList(fileList: FileList): Promise<CodeFile[]> {
  const files: CodeFile[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (shouldSkipPath(file.name)) continue;

    // Handle ZIP
    if (file.name.endsWith(".zip")) {
      // ZIP parsing is handled client-side with JSZip
      continue;
    }

    const content = await file.text();
    const relativePath = (file as any).webkitRelativePath || file.name;
    if (shouldSkipPath(relativePath)) continue;

    files.push({
      name: file.name,
      path: relativePath,
      content,
      language: getLanguage(file.name),
      size: file.size,
    });
  }

  return files;
}

export function parseCodePaste(code: string, filename: string = "code.txt"): CodeFile {
  return {
    name: filename,
    path: filename,
    content: code,
    language: getLanguage(filename),
    size: code.length,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
