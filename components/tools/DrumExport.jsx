"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { exportGrooveVideo } from "@/app/utils/drumVideo.mjs";

export default function DrumExport({ open, onClose, onMidi, groove, sampleBuffers, samplesReady }) {
  const dialogRef = useRef(null);
  const abortRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open) return;
    dialog.showModal();
    return () => {
      abortRef.current?.abort();
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const exportVideo = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setRecording(true);
    setProgress(0);
    setError("");
    try {
      const { blob, extension } = await exportGrooveVideo({ ...groove, sampleBuffers, signal: controller.signal, onProgress: setProgress });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `drum-sheet.${extension}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      if (!controller.signal.aborted && failure.name !== "AbortError") setError(failure.message || "Video export failed.");
    } finally {
      setRecording(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="drum-export-dialog" aria-labelledby="drum-export-title" onClose={onClose} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <header className="drum-library-popup-head">
        <h2 id="drum-export-title">Download groove</h2>
        <Button size="sm" variant="ghost" icon="bi-x-lg" onClick={onClose} aria-label="Close downloads" />
      </header>
      <div className="drum-export-options">
        <Button icon="bi-file-earmark-music" onClick={onMidi} disabled={recording}>MIDI</Button>
        <p>Notes, timing, and dynamics. Your MIDI player supplies the drum sounds.</p>
        <Button variant="primary" icon="bi-camera-video" onClick={exportVideo} disabled={recording || !samplesReady}>Video with drum audio</Button>
        <p>All bars of sheet music, a moving indicator, and the selected kit. Renders one complete pass with synchronized frames and full sound tails.</p>
        {recording && <div role="status"><progress value={progress} max="100" /><span>Rendering {progress}%</span><Button size="sm" onClick={() => abortRef.current?.abort()}>Cancel</Button></div>}
        {error && <p role="alert">{error}</p>}
      </div>
    </dialog>
  );
}
