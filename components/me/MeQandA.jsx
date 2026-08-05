"use client";

import { useState } from "react";

export default function MeQandA({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="me-qa-layout">
      <div className="me-qa-list">
        {items.map((item, index) => {
          const isOpen = activeIndex === index;
          const answerId = `me-answer-${index}`;
          return (
            <article
              className={`me-qa-item ${isOpen ? "is-open" : ""}`}
              key={item.question}
            >
              <button
                type="button"
                className="me-qa-question"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setActiveIndex(index)}
              >
                <span>{item.question}</span>
              </button>

              <div id={answerId} className="me-qa-answer" aria-hidden={!isOpen}>
                <div>
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
