"use client";

import Link from "next/link";

/**
 * Shared Button Component
 *
 * @param {Object} props
 * @param {"primary" | "secondary" | "outline" | "ghost" | "active-root"} [props.variant="secondary"]
 * @param {"xs" | "sm" | "md" | "lg"} [props.size="md"]
 * @param {string | React.ReactNode} [props.icon] - Bootstrap icon class (e.g. "bi-arrow-counterclockwise") or React element
 * @param {"left" | "right"} [props.iconPosition="left"]
 * @param {string} [props.href] - If provided, renders as a Next.js Link or anchor
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 * @param {"button" | "submit" | "reset"} [props.type="button"]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 */
export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconPosition = "left",
  href,
  className = "",
  children,
  type = "button",
  disabled = false,
  onClick,
  ...rest
}) {
  const variantClass = `ui-btn-${variant}`;
  const sizeClass = `ui-btn-${size}`;
  const combinedClassName = `ui-btn ${variantClass} ${sizeClass} ${className}`.trim();

  const iconElement =
    typeof icon === "string" ? (
      <i className={`bi ${icon}`} aria-hidden="true" />
    ) : (
      icon || null
    );

  const content = (
    <>
      {icon && iconPosition === "left" && iconElement}
      {children ? <span>{children}</span> : null}
      {icon && iconPosition === "right" && iconElement}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("//");
    if (isExternal) {
      return (
        <a
          href={href}
          className={combinedClassName}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          {...rest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} onClick={onClick} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}
