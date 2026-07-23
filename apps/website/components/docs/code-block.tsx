"use client";

import { Check, Copy } from "lucide-react";
import { Fragment, useState } from "react";

type SyntaxTokenKind = "comment" | "function" | "keyword" | "literal" | "number" | "property" | "string" | "type";

type SyntaxToken = {
  readonly content: string;
  readonly kind?: SyntaxTokenKind;
};

const TYPESCRIPT_KEYWORDS = new Set([
  "as", "async", "await", "class", "const", "else", "export", "extends", "for", "from", "function", "if", "import", "in", "interface", "let", "new", "of", "return", "satisfies", "type", "typeof", "while",
]);
const TYPESCRIPT_LITERALS = new Set(["false", "null", "true", "undefined"]);

const TYPESCRIPT_PATTERN = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:as|async|await|class|const|else|export|extends|for|from|function|if|import|in|interface|let|new|of|return|satisfies|type|typeof|while|false|null|true|undefined)\b|\b\d+(?:\.\d+)?\b|\b[A-Z][A-Za-z0-9_]*\b/g;
const CSS_PATTERN = /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[0-9a-fA-F]{3,8}\b|\b(?:var|calc|color-mix|min|max|clamp)\b(?=\()|(?:--[\w-]+|[a-z-]+)(?=\s*:)|\b\d+(?:\.\d+)?(?:%|px|rem|em|s|deg)?\b/g;
const BASH_PATTERN = /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:pnpm|npm|yarn|bun|npx|node)\b|(?:^|\n)\s*--?[\w-]+/g;

function classifyToken(content: string, language: string): SyntaxTokenKind {
  if (content.startsWith("//") || content.startsWith("/*") || (language === "bash" && content.startsWith("#"))) {
    return "comment";
  }

  if (content.startsWith('"') || content.startsWith("'") || content.startsWith("`")) {
    return "string";
  }

  if (language === "css") {
    if (content.startsWith("#") || /^\d/.test(content)) return "number";
    if (content.startsWith("--") || content.includes("-")) return "property";
    return "function";
  }

  if (language === "bash") {
    return content.startsWith("-") || content.includes("\n") ? "keyword" : "function";
  }

  if (TYPESCRIPT_KEYWORDS.has(content)) return "keyword";
  if (TYPESCRIPT_LITERALS.has(content)) return "literal";
  if (/^\d/.test(content)) return "number";
  return "type";
}

function tokenPattern(language: string): RegExp | undefined {
  if (language === "css") return CSS_PATTERN;
  if (language === "bash" || language === "shell" || language === "sh") return BASH_PATTERN;
  if (language === "ts" || language === "tsx" || language === "js" || language === "jsx") return TYPESCRIPT_PATTERN;
  return undefined;
}

function highlight(code: string, language: string): readonly SyntaxToken[] {
  const pattern = tokenPattern(language);
  if (!pattern) return [{ content: code }];

  const tokens: SyntaxToken[] = [];
  let cursor = 0;

  for (const match of code.matchAll(pattern)) {
    const content = match[0];
    const index = match.index ?? cursor;
    if (index > cursor) tokens.push({ content: code.slice(cursor, index) });
    tokens.push({ content, kind: classifyToken(content, language) });
    cursor = index + content.length;
  }

  if (cursor < code.length) tokens.push({ content: code.slice(cursor) });
  return tokens;
}

export function CodeBlock({ children, language = "ts" }: { readonly children: string; readonly language?: string }) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = language.toLowerCase();
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="docs-code">
      <div className="docs-code-header">
        <span>{language}</span>
        <button type="button" onClick={() => void copy()} aria-label={copied ? "Copied" : "Copy code"}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre><code>{highlight(children, normalizedLanguage).map((token, index) => token.kind ? (
        <span key={`${token.kind}-${index}`} className={`docs-code-token docs-code-token-${token.kind}`}>{token.content}</span>
      ) : <Fragment key={`plain-${index}`}>{token.content}</Fragment>)}</code></pre>
    </div>
  );
}
