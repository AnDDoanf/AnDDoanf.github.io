"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { THEME_PAIRS, getThemeSnapshot, selectTheme, subscribeToTheme } from "./themeState";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "solarized:light");
  const [palette, mode] = theme.split(":");

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className="theme-picker"
      ref={pickerRef}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          closeAndFocus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="theme-icon theme-icon-picker"
        onClick={(event) => {
          // Mouse hover already opens the panel; preserve tap/keyboard toggling.
          if (event.detail > 0 && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            setOpen(true);
          } else {
            setOpen(!open);
          }
        }}
        aria-label={t("theme.choose")}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {mode === "light" ? <Sun size={22} strokeWidth={2.2} aria-hidden="true" /> : <Moon size={22} strokeWidth={2.2} aria-hidden="true" />}
      </button>
      {open && (
        <div className="theme-picker-panel" id={panelId}>
          <ul className="theme-pairs" aria-label={t("theme.choose")}>
            {THEME_PAIRS.map((pair) => (
              <li className="theme-pair" key={pair}>
                <div className="theme-swatch" data-palette={pair}>
                  {["dark", "light"].map((half) => (
                    <button
                      key={half}
                      type="button"
                      className={`theme-half theme-half-${half}`}
                      aria-label={t("theme.switchTo", { theme: `${t(`theme.pairs.${pair}`)} ${t(`theme.${half}`)}` })}
                      aria-pressed={palette === pair && mode === half}
                      onClick={() => {
                        selectTheme(pair, half);
                        closeAndFocus();
                      }}
                    >
                      {palette === pair && mode === half && <Check size={14} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
