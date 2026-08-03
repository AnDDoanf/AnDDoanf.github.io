"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const categoryIcons = {
  work: "bi bi-briefcase",
  church: "bi bi-heart",
  individual: "bi bi-person",
  gaming: "bi bi-controller"
};

export default function Projects({ initialProjects }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const categories = ["All", "Work", "Church", "Individual", "Gaming"];

  const categoryDescriptions = {
    All: "A comprehensive showcase of my professional, personal, community, and gaming projects.",
    Work: "Enterprise systems, full-stack portals, and landing sites developed during my professional internships and roles.",
    Church: "Web systems and presentation platforms developed to support Christian fellowships and church communities.",
    Individual: "Personal projects built to explore modern design patterns, new tools, and full-stack integration frameworks.",
    Gaming: "Analytical tools, static databases, and automation frameworks developed for my favorite multiplayer video games."
  };

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

  // Auto-cap current index if it goes out of bounds on viewport change
  useEffect(() => {
    setCurrentIndex(prev => (prev > maxIndex ? maxIndex : prev));
  }, [maxIndex]);

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

  const renderProjectCard = (project) => {
    const catLower = project.category.toLowerCase();
    const categoryIcon = categoryIcons[catLower] || "bi bi-laptop";
    const href = `/portfolio/${project.slug}`;

    return (
      <article className="card post-card" style={{ height: "100%" }}>
        <Link href={href} className="post-card-link">
          {/* Cover Image */}
          <div className="card-cover post-card-cover" aria-hidden="true">
            <Image
              src={project.image}
              alt={`${project.title} cover image`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          </div>

          {/* Card Body */}
          <div className="post-card-body">
            <p className="post-card-eyebrow">{project.category}</p>

            <div className="post-card-heading">
              <h2 className="post-card-title">{project.title}</h2>
              <span className="post-card-arrow" aria-hidden="true">
                <i className="bi bi-arrow-up-right" />
              </span>
            </div>

            <p className="post-card-excerpt">{project.description}</p>

            <div className="post-card-footer">
              {/* Meta Section */}
              <div className="post-card-meta">
                <span className="post-card-icon" aria-hidden="true">
                  <i className={categoryIcon} />
                </span>
                <div className="post-card-meta-copy">
                  <p className="post-card-meta-label">{project.category}</p>
                  <p className="post-card-date">{project.tags?.[0] || "Project"}</p>
                </div>
              </div>

              {/* Secondary tags */}
              {project.tags?.length > 1 && (
                <div className="card-tags post-card-tags" aria-hidden="true">
                  {project.tags.slice(1, 3).map((tag) => (
                    <span key={tag} className="card-tag post-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  };

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
      <div className="portfolio-projects-slider-viewport">
        <div
          className="portfolio-projects-slider-track"
          style={{
            "--current-index": currentIndex,
          }}
        >
          {filteredProjects.map((project) => (
            <div key={project.slug} className="portfolio-projects-slider-slide">
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
        aria-label="Previous page"
      >
        <i className="bi bi-chevron-left" />
      </button>
      <button
        onClick={handleNext}
        disabled={maxIndex === 0}
        className="portfolio-projects-slider-btn next"
        aria-label="Next page"
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
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section id="portfolio-projects" className="portfolio-section">
      <h1 className="portfolio-section-title">Projects</h1>

      {/* Tabs */}
      <div className="portfolio-projects-tabs">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleTabChange(category)}
            className={`portfolio-projects-tab ${activeCategory === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Category Description */}
      <p className="portfolio-projects-category-desc">
        {categoryDescriptions[activeCategory]}
      </p>

      {projectListContent}
    </section>
  );
}
