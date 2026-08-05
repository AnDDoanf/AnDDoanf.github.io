"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function HobbiesGrid({ items }) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  function showSlide(index) {
    setActiveIndex((index + items.length) % items.length);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
    if (event.key === "ArrowRight") showSlide(activeIndex + 1);
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;

    if (Math.abs(distance) > 45) {
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }

    touchStartX.current = null;
  }

  return (
    <div
      className="me-hobbies-swiper"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("me.hobbies")}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="me-hobbies-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="me-hobbies-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div
              className="me-hobby-slide"
              key={item.title}
              aria-hidden={index !== activeIndex}
            >
              <article className="me-hobby-card">
                <div className="me-hobby-image-wrap">
                  <img
                    className="me-hobby-image"
                    src={item.image}
                    alt={item.alt || item.title}
                    loading="lazy"
                  />
                </div>
                <div className="me-hobby-copy">
                  <p className="me-hobby-count">
                    {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </p>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  {item.href && (
                    <Link
                      className="me-hobby-link"
                      href={item.href}
                      tabIndex={index === activeIndex ? 0 : -1}
                    >
                      {item.buttonLabel || t("me.explore")}
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="me-hobbies-controls">
        <button
          type="button"
          className="me-hobbies-arrow"
          onClick={() => showSlide(activeIndex - 1)}
          aria-label={t("me.previousHobby")}
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
        </button>

        <div className="me-hobbies-dots" aria-label={t("me.chooseHobby")}>
          {items.map((item, index) => (
            <button
              type="button"
              className={`me-hobbies-dot ${index === activeIndex ? "is-active" : ""}`}
              key={item.title}
              onClick={() => showSlide(index)}
              aria-label={t("me.showHobby", { title: item.title })}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="me-hobbies-arrow"
          onClick={() => showSlide(activeIndex + 1)}
          aria-label={t("me.nextHobby")}
        >
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
