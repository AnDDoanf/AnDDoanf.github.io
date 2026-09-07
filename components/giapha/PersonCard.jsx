"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export function formatPersonDate(dateStr, precision) {
  if (!dateStr) return "";
  if (precision === "year" || dateStr.length === 4) return dateStr.slice(0, 4);
  if (precision === "approximate") return `~${dateStr.slice(0, 4)}`;
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function PersonAvatar({ person, size = "md" }) {
  const gender = person.gender || "unknown";
  const isLiving = person.is_living;
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
  }[size] || "w-11 h-11 text-sm";

  return (
    <div className={`giapha-avatar giapha-avatar-${gender} ${sizeClass} ${!isLiving ? "is-deceased" : ""}`}>
      {person.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.avatar_url}
          alt={person.display_name || person.first_name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <i
          className={`bi ${
            gender === "female"
              ? "bi-gender-female"
              : gender === "male"
              ? "bi-gender-male"
              : "bi-person-fill"
          } giapha-avatar-placeholder`}
          aria-hidden="true"
        />
      )}
      <span
        className={`giapha-status-dot ${isLiving ? "status-living" : "status-deceased"}`}
        title={isLiving ? "Living" : "Deceased"}
      />
    </div>
  );
}

export default function PersonCard({
  person,
  onClick,
  isHighlighted = false,
  isSelected = false,
  compact = false,
}) {
  const { t } = useI18n();

  const birthText = formatPersonDate(person.birth_date, person.birth_date_precision);
  const deathText = formatPersonDate(person.death_date, person.death_date_precision, true);
  const lifeDates = birthText && deathText
    ? `${birthText} – ${deathText}`
    : birthText || (deathText ? `† ${deathText}` : "");

  let lifeSpan = "";
  if (birthText && deathText) {
    lifeSpan = `${birthText} - ${deathText}`;
  } else if (birthText && person.is_living) {
    lifeSpan = `Sinh: ${birthText}`;
  } else if (birthText && !person.is_living) {
    lifeSpan = `Sinh: ${birthText}`;
  } else if (deathText) {
    lifeSpan = `Mất: ${deathText}`;
  }

  if (compact) {
    return (
      <div
        id={`person-node-${person.id}`}
        onClick={() => onClick && onClick(person)}
        className={`giapha-node ${person.gender} ${isHighlighted ? "highlighted" : ""} ${isSelected ? "selected" : ""}`}
        role="button"
        tabIndex={0}
      >
        <PersonAvatar person={person} size="sm" />
        <div className="giapha-node-info">
          <div className="giapha-node-name">{person.display_name || person.first_name}</div>
          {lifeSpan && <div className="giapha-node-lifespan">{lifeSpan}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`person-card-${person.id}`}
      onClick={() => onClick && onClick(person)}
      className={`giapha-person-card ${person.gender} ${isHighlighted ? "highlighted" : ""} ${isSelected ? "selected" : ""}`}
      role="button"
      tabIndex={0}
    >
      <div className="giapha-card-top">
        <PersonAvatar person={person} size="md" />
        <div className="giapha-card-header">
          <div className="giapha-card-name" title={person.display_name}>
            {person.display_name}
          </div>
          {person.maiden_name && (
            <div className="giapha-card-maiden">({person.maiden_name})</div>
          )}
          <div className="giapha-card-badges">
            <span className="giapha-badge gen-badge">
              {t("giapha.generation", { gen: person.generation })}
            </span>
            {person.category && (
              <span className="giapha-badge cat-badge">{person.category}</span>
            )}
          </div>
        </div>
      </div>

      <div className="giapha-card-body">
        {lifeSpan && (
          <div className="giapha-card-row">
            <i className="bi bi-calendar-event" aria-hidden="true" />
            <span>{lifeSpan}</span>
          </div>
        )}
        {person.occupation && (
          <div className="giapha-card-row">
            <i className="bi bi-briefcase" aria-hidden="true" />
            <span className="truncate">{person.occupation}</span>
          </div>
        )}
        {person.birth_place && (
          <div className="giapha-card-row">
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <span className="truncate">{person.birth_place}</span>
          </div>
        )}
        {person.biography && (
          <div className="giapha-card-row giapha-card-bio">
            <i className="bi bi-info-circle" aria-hidden="true" />
            <span className="truncate">{person.biography}</span>
          </div>
        )}
      </div>

      <div className="giapha-card-footer">
        {lifeDates && (
          <span className="giapha-status-tag">
            <i className="bi bi-calendar3" />
            {lifeDates}
          </span>
        )}
        <button
          type="button"
          className="giapha-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(person);
          }}
        >
          {t("giapha.viewProfile")}
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </div>
  );
}
