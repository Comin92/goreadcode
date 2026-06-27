// Lightweight syntax highlighter using regex patterns
// Returns HTML with spans for syntax coloring

interface HighlightRule {
  pattern: RegExp;
  className: string;
}

const COMMON_RULES: HighlightRule[] = [
  // Strings (double, single, template)
  { pattern: /(`(?:[^`\\]|\\.)*`)/g, className: "hl-string" },
  { pattern: /("(?:[^"\\]|\\.)*")/g, className: "hl-string" },
  { pattern: /('(?:[^'\\]|\\.)*')/g, className: "hl-string" },
  // Comments
  { pattern: /(\/\/[^\n]*)/g, className: "hl-comment" },
  { pattern: /(\/\*[\s\S]*?\*\/)/g, className: "hl-comment" },
  { pattern: /(#[^\n]*)/g, className: "hl-comment" },
  // Numbers
  { pattern: /\b(\d+\.?\d*)\b/g, className: "hl-number" },
  // Keywords
  {
    pattern:
      /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|void|delete|yield|static|get|set|public|private|protected|abstract|interface|type|enum|namespace|declare|readonly|override|implements|as|satisfies|using|with|pass|lambda|def|and|or|not|is|True|False|None|self|cls)\b/g,
    className: "hl-keyword",
  },
  // Built-ins / types
  {
    pattern:
      /\b(string|number|boolean|any|unknown|never|void|null|undefined|object|Array|Object|Promise|Map|Set|Record|Partial|Required|Readonly|Omit|Pick|Exclude|Extract|NonNullable|ReturnType|InstanceType|Parameters|ConstructorParameters|int|float|str|bool|list|dict|tuple|bytes|bytearray)\b/g,
    className: "hl-builtin",
  },
  // Function calls
  { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, className: "hl-function" },
  // Decorators
  { pattern: /(@[a-zA-Z_$][a-zA-Z0-9_$]*)/g, className: "hl-decorator" },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightCode(code: string, _language: string): string {
  const lines = code.split("\n");
  return lines
    .map((line) => {
      let escaped = escapeHtml(line);
      // Apply highlighting in order (strings first to avoid keyword matching inside strings)
      // Simple single-pass approach using markers
      escaped = applyHighlight(escaped);
      return escaped;
    })
    .join("\n");
}

function applyHighlight(line: string): string {
  // We'll do a simple tokenizer approach
  // Replace strings first, then comments, then keywords

  // String literals (already escaped, so look for &quot; or &#39;)
  line = line.replace(
    /(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#39;(?:[^&]|&(?!#39;))*?&#39;)/g,
    '<span class="hl-string">$1</span>'
  );

  // Line comments
  line = line.replace(
    /(\/\/[^\n]*|#[^\n]*)/g,
    '<span class="hl-comment">$1</span>'
  );

  // Numbers
  line = line.replace(
    /(?<![a-zA-Z_$])(\d+\.?\d*)(?![a-zA-Z_$])/g,
    '<span class="hl-number">$1</span>'
  );

  // Keywords
  const keywords =
    "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|void|delete|yield|static|get|set|public|private|protected|abstract|interface|type|enum|namespace|declare|readonly|override|implements|as|pass|lambda|def|and|or|not|True|False|None|self";
  line = line.replace(
    new RegExp(`\\b(${keywords})\\b`, "g"),
    '<span class="hl-keyword">$1</span>'
  );

  // Types/builtins
  const builtins =
    "string|number|boolean|any|unknown|never|null|undefined|Array|Object|Promise|Map|Set|int|float|str|bool|list|dict|tuple";
  line = line.replace(
    new RegExp(`\\b(${builtins})\\b`, "g"),
    '<span class="hl-builtin">$1</span>'
  );

  // Function calls
  line = line.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
    '<span class="hl-function">$1</span>'
  );

  // Decorators
  line = line.replace(/(@[a-zA-Z_$][a-zA-Z0-9_$]*)/g, '<span class="hl-decorator">$1</span>');

  return line;
}
