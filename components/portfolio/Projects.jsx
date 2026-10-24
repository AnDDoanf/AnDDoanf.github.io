"use client";

import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Card from "@/components/ui/Card";

const categoryIcons = {
  work: "bi bi-briefcase",
  church: "bi bi-heart",
  individual: "bi bi-person",
  gaming: "bi bi-controller"
};

export default function Projects({ initialProjects }) {
  const { lang, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const isSwipingRef = useRef(false);

  const categories = ["All", "Work", "Church", "Individual", "Gaming"];

  const categoryKey = (category) => `portfolio.categories.${category.toLowerCase()}`;

  const filteredProjects = activeCategory === "All"
    ? initialProjects
    : initialProjects.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  // Detect mobile viewports dynamically and mark component as mounted
  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset index when active category changes
  const handleTabChange = (category) => {
    setActiveCategory(category);
    setCurrentIndex(0);
  };

  const useSlider = filteredProjects.length >= 3;
  const itemsPerView = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, filteredProjects.length - itemsPerView);

  // Generate unique page indices for page-by-page pagination
  const pageIndices = [];
  for (let i = 0; i < filteredProjects.length; i += itemsPerView) {
    pageIndices.push(i);
  }
  if (pageIndices.length > 0 && pageIndices[pageIndices.length - 1] > maxIndex) {
    pageIndices[pageIndices.length - 1] = maxIndex;
  }
  const uniquePageIndices = Array.from(new Set(pageIndices));

  // Keep the selected index on a valid page when the viewport changes.
  useEffect(() => {
    setCurrentIndex(prev => Math.min(Math.floor(prev / itemsPerView) * itemsPerView, maxIndex));
  }, [itemsPerView, maxIndex]);

  const handlePrev = () => {
    if (maxIndex === 0) return;
    const prevIndices = uniquePageIndices.filter(idx => idx < currentIndex);
    if (prevIndices.length > 0) {
      setCurrentIndex(prevIndices[prevIndices.length - 1]);
    } else {
      setCurrentIndex(maxIndex);
    }
  };

  const handleNext = () => {
    if (maxIndex === 0) return;
    const nextIndex = uniquePageIndices.find(idx => idx > currentIndex);
    if (nextIndex !== undefined) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    touchEndRef.current = e.targetTouches[0].clientX;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
    if (Math.abs(touchStartRef.current - touchEndRef.current) > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    const distance = touchStartRef.current - touchEndRef.current;
    if (distance > 35) {
      handleNext();
    } else if (distance < -35) {
      handlePrev();
    }
  };

  const handleClickCapture = (e) => {
    if (isSwipingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isSwipingRef.current = false;
    }
  };

  const renderProjectCard = (project) => {
    const catLower = project.category.toLowerCase();
    const categoryIcon = categoryIcons[catLower] || "bi bi-laptop";
    const href = `/portfolio/${project.slug}`;
    const categoryLabel = t(categoryKey(project.category));

    return (
      <Card
        as="article"
        key={project.slug}
        href={href}
        className="card post-card"
        style={{ height: "100%" }}
        image={project.image}
        imageAlt={`${project.title} cover image`}
        eyebrow={categoryLabel}
        title={project.title}
        description={lang === "vi" ? project.descriptionVi : project.description}
        showArrow
        meta={{
          icon: categoryIcon,
          label: categoryLabel,
          date: project.tags?.[0] || t("portfolio.project"),
        }}
        tags={project.tags?.length > 1 ? project.tags.slice(1, 3) : undefined}
      />
    );
  };

  const slideTransform = isMobile
    ? `translateX(calc(-1 * ${currentIndex} * (100% + var(--project-slide-gap))))`
    : `translateX(calc(-1 * ${currentIndex} * ((100% + var(--project-slide-gap)) / 2)))`;

  const projectListContent = (!isMounted || !useSlider) ? (
    /* Render static grid during server rendering, hydration, or if < 3 projects */
    <div className="post-grid post-card-grid portfolio-projects-grid">
      {filteredProjects.map((project) => (
        <div key={project.slug}>
          {renderProjectCard(project)}
        </div>
      ))}
    </div>
  ) : (
    /* Render interactive slider on the client once mounted */
    <div className="portfolio-projects-slider-container">
      <div
        className="portfolio-projects-slider-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleClickCapture}
      >
        <div className="portfolio-projects-slider-track" style={{ transform: slideTransform }}>
          {filteredProjects.map((project, index) => (
            <div
              key={project.slug}
              className="portfolio-projects-slider-slide"
              aria-hidden={index < currentIndex || index >= currentIndex + itemsPerView}
              inert={index < currentIndex || index >= currentIndex + itemsPerView}
            >
              {renderProjectCard(project)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        disabled={maxIndex === 0}
        className="portfolio-projects-slider-btn prev"
        aria-label={t("portfolio.previousProjects")}
      >
        <i className="bi bi-chevron-left" />
      </button>
      <button
        onClick={handleNext}
        disabled={maxIndex === 0}
        className="portfolio-projects-slider-btn next"
        aria-label={t("portfolio.nextProjects")}
      >
        <i className="bi bi-chevron-right" />
      </button>

      {/* Dots Indicator */}
      <div className="portfolio-projects-slider-dots">
        {uniquePageIndices.map((slideIndex, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(slideIndex)}
            className={`portfolio-projects-slider-dot ${currentIndex === slideIndex ? "active" : ""}`}
            aria-label={t("portfolio.goToProjectPage", { page: idx + 1 })}
            aria-current={currentIndex === slideIndex ? "page" : undefined}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section id="portfolio-projects" className="portfolio-section">
      <h1 className="portfolio-section-title">{t("portfolio.projects")}</h1>

      {/* Tabs */}
      <div className="portfolio-projects-tabs">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleTabChange(category)}
            className={`portfolio-projects-tab ${activeCategory === category ? "active" : ""}`}
          >
            {t(categoryKey(category))}
          </button>
        ))}
      </div>

      {/* Category Description */}
      <p className="portfolio-projects-category-desc">
        {t(`portfolio.categoryDescriptions.${activeCategory.toLowerCase()}`)}
      </p>

      {projectListContent}
    </section>
  );
}
