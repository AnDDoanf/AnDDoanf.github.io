"use client";

import { useEffect, useState } from "react";

const tocItems = [
  { id: 'portfolio-hero', label: 'Intro' },
  { id: 'portfolio-summary', label: 'Summary' },
  { id: 'portfolio-experience', label: 'Experience' },
  { id: 'portfolio-skills', label: 'Skills' },
  { id: 'portfolio-projects', label: 'Projects' },
  { id: 'portfolio-about', label: 'About me' },
];

export default function PortfolioTOC() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger active state when section passes through the center of viewport
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      tocItems.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <aside className="portfolio-toc">
      <p className="portfolio-toc-title">Contents</p>

      <ul className="portfolio-toc-list">
        {tocItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`portfolio-toc-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
