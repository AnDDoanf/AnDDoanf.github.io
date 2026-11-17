"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

export default function DrumLibrary({ open, onClose, library, savedGrooves, onSelect }) {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState("grooves");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const groups = { ...library, saved: savedGrooves };
  const records = groups[tab].filter((item) => `${item.title} ${item.description || ""}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <dialog className="drum-library-dialog" ref={dialogRef} aria-labelledby="drum-library-title" onClose={onClose} onCancel={onClose} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="drum-library-popup">
        <header className="drum-library-popup-head">
          <h2 id="drum-library-title">Groove library</h2>
          <Button size="sm" variant="ghost" icon="bi-x-lg" onClick={onClose} aria-label="Close library" />
        </header>
        <div className="drum-library-popup-tools">
          <div className="drum-library-popup-tabs" role="group" aria-label="Example category">
            {Object.entries(groups).map(([kind, items]) => (
              <Button key={kind} size="sm" variant={tab === kind ? "primary" : "secondary"} aria-pressed={tab === kind} onClick={() => setTab(kind)}>
                {kind === "grooves" ? "Grooves" : kind === "fills" ? "Fills" : "Saved"} ({items.length})
              </Button>
            ))}
          </div>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search examples…" aria-label="Search grooves and fills" />
        </div>
        <div className="drum-library-popup-list">
          {records.map((groove) => (
            <article className="drum-library-example" key={groove.id || groove.slug}>
              <button type="button" onClick={() => onSelect(groove)}>
                <strong>{groove.title}</strong>
                <span>{groove.tempo} BPM · {(groove.timeSignature || [4, 4]).join("/")} · {groove.bars} bar{groove.bars === 1 ? "" : "s"}</span>
                {groove.description && <p>{groove.description}</p>}
                {groove.sticking && <p>Sticking: {groove.sticking}</p>}
                {groove.coordination && <p>Feet: {groove.coordination}</p>}
              </button>
              {groove.reference && <a href={groove.reference} target="_blank" rel="noopener noreferrer" aria-label={`Reference for ${groove.title}`}>Lesson reference <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a>}
            </article>
          ))}
          {!records.length && <p className="drum-library-empty">No examples found.</p>}
        </div>
      </div>
    </dialog>
  );
}
