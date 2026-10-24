"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Shared Card Component
 *
 * Can be used with data props:
 * @param {Object} props
 * @param {"article" | "div" | "section" | "a"} [props.as="article"] - Semantic HTML container tag
 * @param {string} [props.href] - When provided, makes the card interactive and navigates to href
 * @param {boolean} [props.interactive] - Whether the card has interactive hover effects (defaults to true if href is set)
 * @param {string} [props.className] - Additional classes
 * @param {React.CSSProperties} [props.style] - Inline styles
 *
 * Data props:
 * @param {string} [props.image] - Cover image URL
 * @param {string} [props.imageAlt] - Cover image alt text
 * @param {string} [props.imageSizes] - Custom sizes attribute for Next.js Image
 * @param {boolean} [props.imagePriority] - Priority loading for Next.js Image
 * @param {React.ReactNode} [props.cover] - Custom cover element (e.g. for mindmaps or icon previews)
 * @param {string | React.ReactNode} [props.eyebrow] - Eyebrow label / category
 * @param {string | React.ReactNode} [props.title] - Card title heading
 * @param {boolean} [props.showArrow=true] - Whether to show the top-right arrow next to the title
 * @param {string | React.ReactNode} [props.description] - Excerpt / description text
 * @param {string | React.ReactNode} [props.excerpt] - Alias for description
 * @param {Object} [props.meta] - Metadata block ({ icon, label, date })
 * @param {string[]} [props.tags] - Array of tag labels
 * @param {React.ReactNode} [props.footer] - Custom footer element
 * @param {string | React.ReactNode} [props.footerLeft] - Left text / content of footer
 * @param {string | React.ReactNode} [props.footerRight] - Right icon / content of footer
 * @param {React.ReactNode} [props.children] - Child elements (rendered inside body or directly if no data props provided)
 */
export default function Card({
  as: Component = "article",
  href,
  interactive,
  className = "",
  style,

  // Data props
  image,
  imageAlt,
  imageSizes,
  imagePriority,
  cover,
  eyebrow,
  title,
  showArrow,
  description,
  excerpt,
  meta,
  tags,
  footer,
  footerLeft,
  footerRight,

  children,
  ...rest
}) {
  const isInteractive = interactive !== undefined ? interactive : Boolean(href);
  const shouldShowArrow = showArrow !== undefined ? showArrow : Boolean(href && !footer && !footerRight);
  const cardDescription = description || excerpt;
  const hasDataProps = Boolean(
    image || cover || eyebrow || title || cardDescription || meta || (tags && tags.length > 0) || footer || footerLeft || footerRight
  );

  const combinedClassName = [
    "ui-card",
    isInteractive ? "ui-card-interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cardContent = hasDataProps ? (
    <>
      {/* Cover / Image */}
      {cover ? (
        cover
      ) : image ? (
        <div className="card-cover post-card-cover ui-card-cover" aria-hidden="true">
          <Image
            src={image}
            alt={imageAlt || (typeof title === "string" ? `${title} cover image` : "")}
            fill
            sizes={imageSizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            style={{ objectFit: "cover" }}
            priority={imagePriority || false}
          />
        </div>
      ) : null}

      {/* Card Body */}
      <div className="post-card-body mindmap-card-body ui-card-body">
        {eyebrow && (
          <p className="post-card-eyebrow mindmap-eyebrow ui-card-eyebrow">{eyebrow}</p>
        )}

        {title && (
          <div className="post-card-heading ui-card-heading">
            <h2 className="post-card-title ui-card-title">{title}</h2>
            {shouldShowArrow && (
              <span className="post-card-arrow ui-card-arrow" aria-hidden="true">
                <i className="bi bi-arrow-up-right" />
              </span>
            )}
          </div>
        )}

        {cardDescription && (
          <p className="post-card-excerpt ui-card-excerpt">{cardDescription}</p>
        )}

        {/* Footer */}
        {footer ? (
          footer
        ) : (footerLeft || footerRight) ? (
          <div className="mindmap-card-footer post-card-footer ui-card-footer">
            {footerLeft && <span>{footerLeft}</span>}
            {footerRight && (
              typeof footerRight === "string" && footerRight.startsWith("bi-") ? (
                <i className={`bi ${footerRight}`} aria-hidden="true" />
              ) : (
                footerRight
              )
            )}
          </div>
        ) : (meta || (tags && tags.length > 0)) ? (
          <div className="post-card-footer ui-card-footer">
            {meta && (
              <div className="post-card-meta ui-card-meta">
                {meta.icon && (
                  <span className="post-card-icon ui-card-icon" aria-hidden="true">
                    {typeof meta.icon === "string" ? (
                      <i className={meta.icon.startsWith("bi") ? meta.icon : `bi ${meta.icon}`} />
                    ) : (
                      meta.icon
                    )}
                  </span>
                )}
                <div className="post-card-meta-copy ui-card-meta-copy">
                  {meta.label && <p className="post-card-meta-label">{meta.label}</p>}
                  {meta.date && <p className="post-card-date">{meta.date}</p>}
                </div>
              </div>
            )}

            {tags && tags.length > 0 && (
              <div className="card-tags post-card-tags ui-card-tags" aria-hidden="true">
                {tags.map((tag) => (
                  <span key={tag} className="card-tag post-card-tag ui-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {children}
      </div>
    </>
  ) : (
    children
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("//");

    if (Component === "a" || Component === "div") {
      if (isExternal) {
        return (
          <a
            href={href}
            className={combinedClassName}
            style={style}
            target="_blank"
            rel="noopener noreferrer"
            {...rest}
          >
            {cardContent}
          </a>
        );
      }

      return (
        <Link href={href} className={combinedClassName} style={style} {...rest}>
          {cardContent}
        </Link>
      );
    }

    // Default semantic article wrapping an accessible interactive link
    return (
      <Component className={combinedClassName} style={style} {...rest}>
        {isExternal ? (
          <a
            href={href}
            className="post-card-link ui-card-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {cardContent}
          </a>
        ) : (
          <Link href={href} className="post-card-link ui-card-link">
            {cardContent}
          </Link>
        )}
      </Component>
    );
  }

  return (
    <Component className={combinedClassName} style={style} {...rest}>
      {cardContent}
    </Component>
  );
}

Card.Cover = function CardCover({ className = "", children, style, ...rest }) {
  return (
    <div
      className={`card-cover post-card-cover ui-card-cover ${className}`.trim()}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = "", children, style, ...rest }) {
  return (
    <div className={`post-card-body ui-card-body ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className = "", children, style, ...rest }) {
  return (
    <div className={`post-card-footer ui-card-footer ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
};
