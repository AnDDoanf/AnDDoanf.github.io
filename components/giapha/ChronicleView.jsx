"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChronicleView({ tree = {} }) {
  const content = tree.chronicle || "";

  if (!content) {
    return (
      <div className="giapha-empty-state">
        <i className="bi bi-journal-text text-4xl opacity-50 mb-2" />
        <p>Chưa có ký sự dòng họ.</p>
      </div>
    );
  }

  return (
    <div className="giapha-chronicle-container">
      <article className="post-content giapha-chronicle-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
