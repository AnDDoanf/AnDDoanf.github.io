import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownContent from "@/components/blog/MarkdownContent";
import getProjectMetadata from "@/app/utils/getProjectMetadata";
import ScrollToTop from "@/components/ui/ScrollToTop";

function getProjectContent(slug) {
  const file = `data/portfolio/projects/${slug}.md`;

  if (!slug || !fs.existsSync(file)) {
    notFound();
  }

  return matter(fs.readFileSync(file, "utf-8"));
}

export async function generateStaticParams() {
  const projects = getProjectMetadata();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const project = getProjectContent(slug);
    return {
      title: `${project.data.title || slug} | Portfolio`,
    };
  } catch {
    return {
      title: "Project Detail",
    };
  }
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProjectContent(slug);

  const { title, category, description, image, tags, links } = project.data;

  return (
    <main className="project-detail-layout">
      <div className="project-detail-container">
        {/* Back Link */}
        <div className="project-detail-back-wrapper">
          <Link href="/portfolio" className="project-detail-back-link">
            <i className="bi bi-arrow-left" /> Back to Portfolio
          </Link>
        </div>

        {/* Header Section */}
        <header className="project-detail-header">
          {image && (
            <div className="project-detail-cover-container">
              <img src={image} alt={`${title} cover`} className="project-detail-cover" />
            </div>
          )}
          <div className="project-detail-meta">
            <div className="project-detail-badge-row">
              <span className={`portfolio-project-category-badge ${category?.toLowerCase()}`}>
                {category}
              </span>
            </div>
            <h1 className="project-detail-title">{title}</h1>
            <p className="project-detail-desc">{description}</p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="project-detail-tags">
                {tags.map((tag) => (
                  <span key={tag} className="project-detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="project-detail-links">
              {links?.live && (
                <a
                  href={links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-detail-link-btn primary"
                >
                  <i className="bi bi-box-arrow-up-right" /> Live Demo
                </a>
              )}
              {links?.repo && (
                <a
                  href={links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-detail-link-btn"
                >
                  <i className="bi bi-github" /> View Code
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Separator */}
        <hr className="project-detail-divider" />

        {/* Markdown Content */}
        <div className="project-detail-body post-content">
          <MarkdownContent content={project.content} />
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
