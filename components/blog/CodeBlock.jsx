"use client";

import { useState } from "react";
import Prism from "prismjs";

// Common language grammars
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-css";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-docker";

const LANGUAGE_ALIASES = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  golang: "go",
  cs: "csharp",
};

export default function CodeBlock({ className, children, ...props }) {
  const [copied, setCopied] = useState(false);

  // Extract raw string text
  let rawCode = "";
  if (typeof children === "string") {
    rawCode = children;
  } else if (Array.isArray(children)) {
    rawCode = children
      .map((child) => (typeof child === "string" ? child : child?.props?.children || ""))
      .join("");
  } else {
    rawCode = String(children || "");
  }

  // Determine language from className (e.g., "language-javascript")
  const languageMatch = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
  const rawLanguage = languageMatch ? languageMatch[1].toLowerCase() : "";
  const language = LANGUAGE_ALIASES[rawLanguage] || rawLanguage || "text";

  // Is this an inline code element or a block?
  // In ReactMarkdown, inline code usually doesn't have a trailing newline or language class
  const isInline = !languageMatch && !rawCode.includes("\n");

  let highlightedHtml = "";
  if (!isInline) {
    const grammar = Prism.languages[language];
    if (grammar) {
      try {
        highlightedHtml = Prism.highlight(rawCode, grammar, language);
      } catch {
        // Fallback to plain text on highlighting error
      }
    }
    if (!highlightedHtml) {
      // Safe fallback: HTML escape
      highlightedHtml = rawCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = rawCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isInline) {
    return (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  }

  const displayLang = language === "text" ? "CODE" : language.toUpperCase();

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">
          <i className="bi bi-file-earmark-code me-1" aria-hidden="true" />
          {displayLang}
        </span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <i className="bi bi-check2 text-success" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <i className="bi bi-clipboard" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className={`code-block-pre language-${language}`}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}
