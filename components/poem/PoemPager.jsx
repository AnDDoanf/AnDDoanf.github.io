"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function PoemPager({ poems }) {
  const [index, setIndex] = useState(0);

  const prev = () => index > 0 && setIndex(index - 1);
  const next = () => index < poems.length - 1 && setIndex(index + 1);

  return (
    <div className="poem-layout">
      {/* Poem content */}
      <section className="poem-book">
        <div
          className="poem-page"
          key={poems[index].slug}
        >
          <div className="poem-controls">
            <button onClick={prev} disabled={index === 0}>← Prev</button>
            <span>{index + 1} / {poems.length}</span>
            <button onClick={next} disabled={index === poems.length - 1}>Next →</button>
          </div>
          <h1 className="poem-title">{poems[index].title}</h1>
          <div className="poem-content">
            <ReactMarkdown >
              {poems[index].content}
            </ReactMarkdown>
          </div>
        </div>
      </section>

      {/* Right TOC */}
      <aside className="poem-toc">
        <h3>Poems</h3>
        <ul>
          {poems.map((p, i) => (
            <li
              key={p.slug}
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
            >
              {p.title}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
