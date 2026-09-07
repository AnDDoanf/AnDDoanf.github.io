"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { PersonAvatar, formatPersonDate } from "./PersonCard";

export default function PersonDetailModal({
  person,
  allPersons = [],
  isRoot = false,
  onClose,
  onSelectPerson,
  onLocateInTree,
  onMakeRoot,
  onClearRoot,
}) {
  const { lang, t } = useI18n();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!person) return null;

  const personMap = new Map(allPersons.map((p) => [p.id, p]));

  // Related people
  const parents = (person.parent_ids || [])
    .map((id) => personMap.get(id))
    .filter(Boolean);

  const spouses = (person.spouse_ids || [])
    .map((id) => personMap.get(id))
    .filter(Boolean);

  const children = (person.children_ids || [])
    .map((id) => personMap.get(id))
    .filter(Boolean);

  // Compute siblings (share at least one parent)
  const siblingIds = new Set();
  if (person.parent_ids && person.parent_ids.length > 0) {
    allPersons.forEach((other) => {
      if (other.id !== person.id && other.parent_ids) {
        const hasCommonParent = other.parent_ids.some((pid) =>
          person.parent_ids.includes(pid)
        );
        if (hasCommonParent) {
          siblingIds.add(other.id);
        }
      }
    });
  }
  const siblings = Array.from(siblingIds)
    .map((id) => personMap.get(id))
    .filter(Boolean);

  const birthFormatted = formatPersonDate(
    person.birth_date,
    person.birth_date_precision
  );
  const deathFormatted = formatPersonDate(
    person.death_date,
    person.death_date_precision,
    true
  );
  const lifeDates = birthFormatted && deathFormatted
    ? `${birthFormatted} – ${deathFormatted}`
    : birthFormatted || (deathFormatted ? `† ${deathFormatted}` : "");

  const genderLabel = {
    male: t("giapha.male"),
    female: t("giapha.female"),
    other: t("giapha.other"),
    unknown: t("giapha.unknown"),
  }[person.gender] || person.gender;

  return (
    <div className="giapha-modal-backdrop" onClick={onClose}>
      <div
        className="giapha-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-person-title"
      >
        {/* Header Banner */}
        <div className="giapha-modal-header">
          <div className="giapha-modal-hero">
            <PersonAvatar person={person} size="lg" />
            <div className="giapha-modal-title-group">
              <h2 id="modal-person-title" className="giapha-modal-title">
                {person.display_name}
              </h2>
              {person.maiden_name && (
                <div className="giapha-modal-maiden">
                  {t("giapha.maidenName")}: {person.maiden_name}
                </div>
              )}
              <div className="giapha-modal-badges">
                <span className="giapha-badge gen-badge">
                  {t("giapha.generation", { gen: person.generation })}
                </span>
                {person.category && (
                  <span className="giapha-badge cat-badge">{person.category}</span>
                )}
                {lifeDates && (
                  <span className="giapha-badge status-badge">
                    <i className="bi bi-calendar3" />
                    {lifeDates}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="giapha-modal-close"
            onClick={onClose}
            aria-label={t("giapha.closeModal")}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="giapha-modal-content">
          {/* Quick Info Grid */}
          <div className="giapha-info-grid">
            <div className="giapha-info-item">
              <span className="giapha-info-label">{t("giapha.gender")}</span>
              <span className="giapha-info-val">
                <i
                  className={`bi ${
                    person.gender === "male"
                      ? "bi-gender-male text-blue-400"
                      : person.gender === "female"
                      ? "bi-gender-female text-pink-400"
                      : "bi-gender-ambiguous"
                  } mr-1.5`}
                />
                {genderLabel}
              </span>
            </div>

            <div className="giapha-info-item">
              <span className="giapha-info-label">{t("giapha.birthDate")}</span>
              <span className="giapha-info-val">
                {birthFormatted || t("giapha.unknown")}
                {birthFormatted && person.birth_date_precision && person.birth_date_precision !== "unknown" && (
                  <small className="ml-1 opacity-70">
                    ({person.birth_date_precision})
                  </small>
                )}
              </span>
            </div>

            {!person.is_living && (
              <div className="giapha-info-item">
                <span className="giapha-info-label">{t("giapha.deathDate")}</span>
                <span className="giapha-info-val">
                  {deathFormatted || t("giapha.unknown")}
                  {deathFormatted && person.death_date_precision && person.death_date_precision !== "unknown" && (
                    <small className="ml-1 opacity-70">
                      ({person.death_date_precision})
                    </small>
                  )}
                </span>
              </div>
            )}

            {person.occupation && (
              <div className="giapha-info-item">
                <span className="giapha-info-label">{t("giapha.occupation")}</span>
                <span className="giapha-info-val">{person.occupation}</span>
              </div>
            )}

            {person.birth_place && (
              <div className="giapha-info-item">
                <span className="giapha-info-label">{t("giapha.birthPlace")}</span>
                <span className="giapha-info-val">{person.birth_place}</span>
              </div>
            )}

            {!person.is_living && person.death_place && (
              <div className="giapha-info-item">
                <span className="giapha-info-label">{t("giapha.deathPlace")}</span>
                <span className="giapha-info-val">{person.death_place}</span>
              </div>
            )}
          </div>

          {/* Biography */}
          {person.biography && (
            <div className="giapha-section">
              <h3 className="giapha-section-title">
                <i className="bi bi-card-text mr-2" />
                {t("giapha.biography")}
              </h3>
              <p className="giapha-bio-text">{person.biography}</p>
            </div>
          )}

          {/* Relationships Explorer */}
          <div className="giapha-section">
            <h3 className="giapha-section-title">
              <i className="bi bi-diagram-3 mr-2" />
              {t("giapha.spouses")} &amp; {t("giapha.parents")}
            </h3>

            {/* Parents */}
            {parents.length > 0 && (
              <div className="giapha-rel-group">
                <div className="giapha-rel-label">{t("giapha.parents")}:</div>
                <div className="giapha-rel-chips">
                  {parents.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="giapha-rel-chip"
                      onClick={() => onSelectPerson && onSelectPerson(p)}
                    >
                      <PersonAvatar person={p} size="sm" />
                      <span>{p.display_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spouses */}
            {spouses.length > 0 && (
              <div className="giapha-rel-group">
                <div className="giapha-rel-label">{t("giapha.spouses")}:</div>
                <div className="giapha-rel-chips">
                  {spouses.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="giapha-rel-chip spouse"
                      onClick={() => onSelectPerson && onSelectPerson(s)}
                    >
                      <PersonAvatar person={s} size="sm" />
                      <span>{s.display_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Siblings */}
            {siblings.length > 0 && (
              <div className="giapha-rel-group">
                <div className="giapha-rel-label">{t("giapha.siblings")}:</div>
                <div className="giapha-rel-chips">
                  {siblings.map((sib) => (
                    <button
                      key={sib.id}
                      type="button"
                      className="giapha-rel-chip"
                      onClick={() => onSelectPerson && onSelectPerson(sib)}
                    >
                      <PersonAvatar person={sib} size="sm" />
                      <span>{sib.display_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div className="giapha-rel-group">
                <div className="giapha-rel-label">{t("giapha.children")}:</div>
                <div className="giapha-rel-chips">
                  {children.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="giapha-rel-chip child"
                      onClick={() => onSelectPerson && onSelectPerson(c)}
                    >
                      <PersonAvatar person={c} size="sm" />
                      <span>{c.display_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="giapha-modal-footer">
          {onMakeRoot && (
            <Button
              variant={isRoot ? "active-root" : "secondary"}
              size="sm"
              icon={isRoot ? "bi-arrow-counterclockwise" : "bi-diagram-3"}
              onClick={() => {
                if (isRoot && onClearRoot) {
                  onClearRoot();
                } else {
                  onMakeRoot(person);
                }
              }}
            >
              {isRoot
                ? (t("giapha.resetRoot") || (lang === "en" ? "Show full tree" : "Bỏ đặt làm gốc"))
                : (t("giapha.makeRoot") || (lang === "en" ? "Set as root" : "Đặt làm gốc"))}
            </Button>
          )}
          {onLocateInTree && (
            <Button
              variant="primary"
              size="sm"
              icon="bi-crosshair"
              onClick={() => {
                onLocateInTree(person);
                onClose();
              }}
            >
              {t("giapha.viewInTree")}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            {t("giapha.closeModal")}
          </Button>
        </div>
      </div>
    </div>
  );
}
