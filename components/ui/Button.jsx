"use client";

import Link from "next/link";

/**
 * Shared Button Component
 *
 * @param {Object} props
 * @param {"primary" | "secondary" | "outline" | "ghost" | "active-root" | "subtle"} [props.variant="secondary"]
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
  const isActuallyDisabled = Boolean(disabled);
  const variantClass = `ui-btn-${variant}`;
  const sizeClass = `ui-btn-${size}`;
  const combinedClassName = [
    "ui-btn",
    variantClass,
    sizeClass,
    isActuallyDisabled ? "disabled is-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
    const handleLinkClick = (event) => {
      if (isActuallyDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    if (isExternal) {
      return (
        <a
          href={isActuallyDisabled ? undefined : href}
          className={combinedClassName}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={isActuallyDisabled}
          tabIndex={isActuallyDisabled ? -1 : undefined}
          onClick={handleLinkClick}
          {...rest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={isActuallyDisabled ? "#" : href}
        className={combinedClassName}
        aria-disabled={isActuallyDisabled}
        tabIndex={isActuallyDisabled ? -1 : undefined}
        onClick={handleLinkClick}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={isActuallyDisabled}
      aria-disabled={isActuallyDisabled}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}
