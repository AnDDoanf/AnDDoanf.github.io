"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import DrumSheet from "@/components/tools/DrumSheet";
import DrumLibrary from "@/components/tools/DrumLibrary";
import DrumExport from "@/components/tools/DrumExport";
import { expandDrumNote, scheduleDrumSound } from "@/app/utils/drumAudio.mjs";
import { grooveToMidi } from "@/app/utils/drumMidi.mjs";
import { decodeDrumSheet, encodeDrumSheet } from "@/app/utils/drumSheetUrl.mjs";

const STORAGE_KEY = "groovelab-library-v1";

const KITS = [
  { id: "groovescribe", name: "GrooveScribe", description: "Mike Johnston’s original GrooveScribe kit", sounds: {
    "crash:normal": "/samples/groovescribe/Crash.mp3", "ride:normal": "/samples/groovescribe/Ride.mp3", "ride:bell": "/samples/groovescribe/Bell.mp3", "cowbell:normal": "/samples/groovescribe/Cowbell.mp3",
    "hihat:normal": "/samples/groovescribe/Hi%20Hat%20Normal.mp3", "hihat:open": "/samples/groovescribe/Hi%20Hat%20Open.mp3", "hihat:accent": "/samples/groovescribe/Hi%20Hat%20Accent.mp3", "hihat:foot": "/samples/groovescribe/Hi%20Hat%20Foot.mp3", "hihat:stacker": "/samples/groovescribe/Stacker.mp3", "hihat:click": "/samples/groovescribe/metronomeClick.mp3", "hihat:click-accent": "/samples/groovescribe/metronome1Count.mp3",
    "openhat:normal": "/samples/groovescribe/Hi%20Hat%20Open.mp3", "openhat:accent": "/samples/groovescribe/Hi%20Hat%20Accent.mp3", "openhat:foot": "/samples/groovescribe/Hi%20Hat%20Foot.mp3",
    "snare:normal": "/samples/groovescribe/Snare%20Normal.mp3", "snare:accent": "/samples/groovescribe/Snare%20Accent.mp3", "snare:ghost": "/samples/groovescribe/Snare%20Ghost.mp3", "snare:cross-stick": "/samples/groovescribe/Snare%20Cross%20Stick.mp3", "snare:buzz": "/samples/groovescribe/Buzz.mp3", "snare:flam": "/samples/groovescribe/Snare%20Flam.mp3",
    "tom:normal": "/samples/groovescribe/Rack%20Tom.mp3", "tom:accent": "/samples/groovescribe/10%20Tom.mp3", "midtom:normal": "/samples/groovescribe/Rack%20Tom.mp3", "midtom:accent": "/samples/groovescribe/10%20Tom.mp3", "lowtom:normal": "/samples/groovescribe/Floor%20Tom.mp3", "lowtom:accent": "/samples/groovescribe/16%20Tom.mp3",
    "kick:normal": "/samples/groovescribe/Kick.mp3", "kick:foot": "/samples/groovescribe/Hi%20Hat%20Foot.mp3", "kick:kick-hat-foot": "/samples/groovescribe/Kick.mp3",
  } },
  { id: "acoustic", name: "Acoustic", description: "CC0 studio drum recordings", sounds: { kick: "/samples/acoustic/Kicks/Kick%20Acoustic.mp3", snare: "/samples/acoustic/Snares/Snare%20Acoustic.mp3", hihat: "/samples/acoustic/Hats/Hat%20Closed%20Acoustic.mp3", openhat: "/samples/acoustic/Hats/Hat%20Open%20Acoustic.mp3", tom: "/samples/acoustic/Toms/Tom%20High.mp3", midtom: "/samples/acoustic/Toms/Tom%20Low.mp3", lowtom: "/samples/acoustic/Toms/Tom%20Floor.mp3", crash: "/samples/acoustic/Cymbals/Crash.mp3", ride: "/samples/acoustic/Cymbals/Ride.mp3" } },
  { id: "electronic", name: "Electronic", description: "Punchy synthesized drum sounds", sounds: { kick: "/samples/electronic/Kicks/Kick%20Electronic.mp3", snare: "/samples/electronic/Snares/Snare%20Electronic.mp3", hihat: "/samples/electronic/Hats/Hat%20Closed%20Analog.mp3", openhat: "/samples/electronic/Hats/Hat%20Open%20Analog.mp3" } },
  { id: "lofi", name: "Lo-fi", description: "Soft, dusty and mellow hits", sounds: { kick: "/samples/lofi/Kicks/Kick%20Soft.mp3", snare: "/samples/lofi/Snares/Snare%20Electronic.mp3", hihat: "/samples/lofi/Hats/Hat%20Closed%20Tight.mp3", openhat: "/samples/acoustic/Hats/Hat%20Open%20Acoustic.mp3", tom: "/samples/acoustic/Toms/Tom%20High.mp3", midtom: "/samples/acoustic/Toms/Tom%20Low.mp3", lowtom: "/samples/lofi/Toms/Tom%20Floor.mp3", crash: "/samples/acoustic/Cymbals/Crash.mp3", ride: "/samples/acoustic/Cymbals/Ride.mp3" } },
];

const INSTRUMENTS = [
  { id: "crash", label: "Crash", short: "CR", midi: 49, group: "CYMBALS" },
  { id: "ride", label: "Ride", short: "RD", midi: 51, group: "CYMBALS" },
  { id: "cowbell", label: "Cow bell", short: "CB", midi: 56, group: "CYMBALS" },
  { id: "hihat", label: "Hi-hat", short: "HH", midi: 42, group: "CYMBALS" },
  { id: "openhat", label: "Open hi-hat", short: "OH", midi: 46, group: "CYMBALS" },
  { id: "snare", label: "Snare", short: "SN", midi: 38, group: "DRUMS" },
  { id: "tom", label: "High tom", short: "HT", midi: 50, group: "DRUMS" },
  { id: "midtom", label: "Mid tom", short: "MT", midi: 47, group: "DRUMS" },
  { id: "lowtom", label: "Floor tom", short: "FT", midi: 43, group: "DRUMS" },
  { id: "kick", label: "Kick", short: "BD", midi: 36, group: "DRUMS" },
];
const STEPS = 16;
const NOTE_DIVISIONS = [
  { value: 8, label: "1/8", kind: "NOTES" },
  { value: 16, label: "1/16", kind: "NOTES" },
  { value: 32, label: "1/32", kind: "NOTES" },
  { value: 12, label: "1/8", kind: "TRIPLETS" },
  { value: 24, label: "1/16", kind: "TRIPLETS" },
];
const EMPTY = () => Object.fromEntries(INSTRUMENTS.map(({ id }) => [id, {}]));
const DEFAULT_VARIANTS = Object.fromEntries(INSTRUMENTS.map(({ id }) => [id, id === "hihat" ? "normal" : id === "snare" ? "normal" : "normal"]));
const VARIANTS = {
  crash: [{ id: "off", label: "Off" }, { id: "normal", label: "Crash" }],
  ride: [{ id: "off", label: "Off" }, { id: "normal", label: "Ride" }, { id: "bell", label: "Ride Bell" }],
  cowbell: [{ id: "off", label: "Off" }, { id: "normal", label: "Cow Bell" }],
  hihat: [{ id: "off", label: "Off" }, { id: "normal", label: "Hi-hat normal" }, { id: "open", label: "Hi-hat open" }, { id: "accent", label: "Hi-hat accent" }, { id: "foot", label: "Hi-hat foot" }, { id: "stacker", label: "Stacker" }, { id: "click", label: "Click" }, { id: "click-accent", label: "Click - accent" }],
  openhat: [{ id: "off", label: "Off" }, { id: "normal", label: "Hi-hat open" }, { id: "accent", label: "Hi-hat accent" }],
  snare: [{ id: "off", label: "Off" }, { id: "normal", label: "Snare normal" }, { id: "accent", label: "Snare accent" }, { id: "ghost", label: "Ghost note" }, { id: "cross-stick", label: "Cross stick" }, { id: "buzz", label: "Buzz stroke" }, { id: "flam", label: "Flam" }],
  tom: [{ id: "off", label: "Off" }, { id: "normal", label: "High tom" }, { id: "accent", label: "High tom accent" }],
  midtom: [{ id: "off", label: "Off" }, { id: "normal", label: "Mid tom" }, { id: "accent", label: "Mid tom accent" }],
  lowtom: [{ id: "off", label: "Off" }, { id: "normal", label: "Floor tom" }, { id: "accent", label: "Floor tom accent" }],
  kick: [{ id: "off", label: "Off" }, { id: "normal", label: "Kick normal" }, { id: "foot", label: "Hi-hat foot" }, { id: "kick-hat-foot", label: "Kick & hi-hat foot" }],
};
const NOTE_SYMBOLS = { crash: "×", ride: "×", cowbell: "×", hihat: "×", openhat: "×", snare: "●", tom: "●", midtom: "●", lowtom: "●", kick: "●" };

function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DrumNotation({ library }) {
  const [pattern, setPattern] = useState(EMPTY);
  const [bars, setBars] = useState(1);
  const [tempo, setTempo] = useState(100);
  const [timeSignature, setTimeSignature] = useState([4, 4]);
  const [division, setDivision] = useState(16);
  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [selectedInstrument, setSelectedInstrument] = useState("hihat");
  const [kitId, setKitId] = useState("groovescribe");
  const [sampleBuffers, setSampleBuffers] = useState({});
  const [samplesReady, setSamplesReady] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [savedGrooves, setSavedGrooves] = useState([]);
  const [grooveName, setGrooveName] = useState("Untitled groove");
  const [noteMenu, setNoteMenu] = useState(null);
  const [gridViewportWidth, setGridViewportWidth] = useState(0);
  const [urlReady, setUrlReady] = useState(false);
  const audioRef = useRef(null);
  const gridWrapRef = useRef(null);
  const noteMenuRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const stepsPerBeat = division / timeSignature[1];
  const stepsPerBar = timeSignature[0] * stepsPerBeat;
  const width = bars * stepsPerBar;
  const barWidth = Math.max(stepsPerBar * 38, (gridViewportWidth - 165) / bars);
  const gridBeatSteps = Number.isInteger(stepsPerBeat) ? stepsPerBeat : division / 4;
  const changeTimeSignature = (value) => {
    const next = value.split("/").map(Number);
    if (!Number.isInteger(next[0] * division / next[1])) setDivision(24);
    setTimeSignature(next);
  };
  const divisionIsCompatible = (value) => Number.isInteger(timeSignature[0] * value / timeSignature[1]);
  const stepLabel = (step) => {
    const offset = step % gridBeatSteps;
    if (offset === 0) return `${Math.floor(step / gridBeatSteps) + 1}`;
    if (division === 12) return offset % 3 === 1 ? "trip" : "let";
    if (division === 24) return ["", "ta", "la", "&", "ta", "la"][offset % 6];
    return offset % (gridBeatSteps / 2) === 0 ? "&" : "e";
  };

  useEffect(() => {
    if (!noteMenu) return;
    const dismissOutside = (event) => {
      if (!noteMenuRef.current?.contains(event.target)) setNoteMenu(null);
    };
    const dismissOnEscape = (event) => {
      if (event.key === "Escape") setNoteMenu(null);
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [noteMenu]);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const sheet = decodeDrumSheet(params.get("sheet"));
      if (sheet) {
        clearInterval(timerRef.current);
        setPlaying(false);
        setActiveStep(-1);
        setPattern(sheet.pattern);
        setBars(sheet.bars);
        setTempo(sheet.tempo);
        setDivision(sheet.division);
        setTimeSignature(sheet.timeSignature);
        setKitId(sheet.kitId);
        setGrooveName(sheet.grooveName);
        setNoteMenu(null);
      }
      setUrlReady(true);
    };
    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
    };
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.slice(1));
    params.set("sheet", encodeDrumSheet({ pattern, bars, tempo, division, timeSignature, kitId, grooveName }));
    url.hash = params.toString();
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
  }, [urlReady, pattern, bars, tempo, division, timeSignature, kitId, grooveName]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    audioRef.current?.close();
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setSavedGrooves(saved);
    } catch { setSavedGrooves([]); }
  }, []);

  useEffect(() => {
    const element = gridWrapRef.current;
    if (!element) return undefined;
    const measure = () => setGridViewportWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const AudioContextType = window.AudioContext || window.webkitAudioContext;
      const context = audioRef.current || new AudioContextType();
      audioRef.current = context;
      const kit = KITS.find((item) => item.id === kitId) || KITS[0];
      const decoded = {};
      await Promise.all(Object.entries(kit.sounds).map(async ([instrument, url]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Sample failed: ${url}`);
          decoded[instrument] = await context.decodeAudioData(await response.arrayBuffer());
        } catch { /* An individual sound can still use the synthesis fallback. */ }
      }));
      if (!cancelled) {
        setSampleBuffers(decoded);
        setSamplesReady(true);
      }
    };
    setSamplesReady(false);
    load();
    return () => { cancelled = true; };
  }, [kitId]);

  const persistGrooves = (next) => {
    setSavedGrooves(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep editing if storage is unavailable. */ }
  };

  const saveGroove = () => {
    const name = window.prompt("Name this groove", grooveName)?.trim();
    if (!name) return;
    const groove = { id: `saved-${Date.now()}`, title: name, category: "saved", tempo, bars, division, timeSignature, pattern, updatedAt: new Date().toISOString() };
    setGrooveName(name);
    persistGrooves([groove, ...savedGrooves.filter((item) => item.title !== name)]);
  };

  const loadGroove = (groove) => {
    stop();
    const normalized = { ...EMPTY() };
    INSTRUMENTS.forEach(({ id }) => {
      const notes = groove.pattern?.[id];
      normalized[id] = Array.isArray(notes)
        ? Object.fromEntries(notes.map((step) => [step, "normal"]))
        : { ...(notes || {}) };
    });
    setPattern(normalized);
    setTempo(groove.tempo || 100);
    setBars(groove.bars || 1);
    setDivision(groove.division || 16);
    setTimeSignature(groove.timeSignature || [4, 4]);
    setGrooveName(groove.title);
    setLibraryOpen(false);
  };

  const removeGroove = (id) => persistGrooves(savedGrooves.filter((item) => item.id !== id));

  const sound = useCallback((instrumentId, velocity = 0.8, variant = "normal") => {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    const context = audioRef.current || new AudioContextType();
    audioRef.current = context;
    if (context.state === "suspended") context.resume();
    scheduleDrumSound(context, context.destination, sampleBuffers, instrumentId, velocity, variant);
  }, [sampleBuffers]);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setActiveStep(-1);
  }, []);

  const play = useCallback(() => {
    if (playing) { stop(); return; }
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    const audio = audioRef.current || new AudioContextType();
    audioRef.current = audio;
    if (audio.state === "suspended") audio.resume();
    setPlaying(true);
  }, [playing, stop]);

  useEffect(() => {
    if (!playing) return undefined;
    stepRef.current = 0;
    const tick = () => {
      const step = stepRef.current % (bars * stepsPerBar);
      setActiveStep(step);
      patternRef.current && INSTRUMENTS.forEach(({ id }) => {
        const variant = patternRef.current[id][step];
        for (const note of expandDrumNote(id, variant)) {
          sound(note.instrument, note.velocity, note.variant);
        }
      });
      stepRef.current++;
    };
    tick();
    timerRef.current = setInterval(tick, 60000 / tempo / (division / 4));
    return () => clearInterval(timerRef.current);
  }, [bars, division, playing, sound, stepsPerBar, tempo]);

  const toggleNote = (instrumentId, step) => {
    if (!pattern[instrumentId][step]) {
      sound(instrumentId, 0.82, DEFAULT_VARIANTS[instrumentId]);
    }
    setPattern((current) => {
      const row = { ...current[instrumentId] };
      if (row[step]) delete row[step];
      else row[step] = DEFAULT_VARIANTS[instrumentId];
      return { ...current, [instrumentId]: row };
    });
  };

  const setNoteVariant = (instrumentId, step, variant) => {
    if (variant === "foot") sound("hihat", 0.72, "foot");
    else if (variant === "kick-hat-foot") {
      sound("kick", 0.9, variant);
      sound("hihat", 0.72, "foot");
    } else if (variant !== "off") {
      sound(instrumentId, variant === "ghost" ? 0.5 : variant === "accent" || variant === "flam" ? 1 : 0.82, variant);
    }
    setPattern((current) => {
      const row = { ...current[instrumentId] };
      if (variant === "off") delete row[step];
      else row[step] = variant;
      return { ...current, [instrumentId]: row };
    });
    setNoteMenu(null);
  };

  const removeBar = (bar) => {
    if (bar < 1 || bar >= bars) return;
    const start = bar * stepsPerBar;
    setPattern((current) => Object.fromEntries(INSTRUMENTS.map(({ id }) => [
      id,
      Object.fromEntries(Object.entries(current[id]).flatMap(([position, variant]) => {
        const step = Number(position);
        if (step >= start && step < start + stepsPerBar) return [];
        return [[step >= start + stepsPerBar ? step - stepsPerBar : step, variant]];
      })),
    ])));
    setBars((count) => count - 1);
  };

  const insertBar = (barIndex) => {
    const insertionStep = barIndex * stepsPerBar;
    const sourceBar = Math.max(0, barIndex - 1);
    const sourceStart = sourceBar * stepsPerBar;
    setPattern((current) => Object.fromEntries(INSTRUMENTS.map(({ id }) => {
      const notes = Object.entries(current[id] || {});
      const shifted = notes.map(([position, variant]) => {
        const step = Number(position);
        return [step >= insertionStep ? step + stepsPerBar : step, variant];
      });
      const copied = notes.flatMap(([position, variant]) => {
        const step = Number(position);
        if (step < sourceStart || step >= sourceStart + stepsPerBar) return [];
        return [[insertionStep + step - sourceStart, variant]];
      });
      return [id, Object.fromEntries([...shifted, ...copied])];
    })));
    setBars((count) => count + 1);
  };

  const clearPattern = () => { stop(); setPattern(EMPTY()); };
  const loadExample = () => {
    const example = EMPTY();
    for (let bar = 0; bar < bars; bar++) {
      const offset = bar * stepsPerBar;
      example.kick[offset] = "normal";
      example.kick[offset + stepsPerBeat * 2] = "normal";
      example.snare[offset + stepsPerBeat] = "normal";
      example.snare[offset + stepsPerBeat * 3] = "normal";
      for (let step = 0; step < stepsPerBar; step += stepsPerBeat / 2) example.hihat[offset + step] = "normal";
    }
    setPattern(example);
  };

  const exportMidi = () => {
    const midi = grooveToMidi({ pattern, tempo, bars, division, timeSignature, sampleBuffers });
    downloadFile("drum-groove.mid", midi, "audio/midi");
  };

  return (
    <div className="drum-app">
      <main className="drum-main">
        <section className="drum-editor" aria-label="Drum pattern editor">
          <div className="drum-editor-top">
            <div className="drum-pattern-meta">
              <span><i className="bi bi-music-note-beamed" aria-hidden="true" /> {bars} bar{bars === 1 ? "" : "s"}</span>
            </div>
            <div className="drum-toolbar-controls">
              <div className="drum-mobile-settings">
                <label>
                  <span>KIT</span>
                  <select value={kitId} onChange={(event) => setKitId(event.target.value)}>
                    {KITS.map((kit) => <option key={kit.id} value={kit.id}>{kit.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>TIME</span>
                  <select value={`${timeSignature[0]}/${timeSignature[1]}`} onChange={(event) => changeTimeSignature(event.target.value)}>
                    {["4/4", "3/4", "6/8", "9/8", "12/8", "5/4", "7/8"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label>
                  <span>DIVISION</span>
                  <select value={division} onChange={(event) => setDivision(Number(event.target.value))}>
                    {NOTE_DIVISIONS.map(({ value, label, kind }) => <option key={value} value={value} disabled={!divisionIsCompatible(value)}>{label} {kind.toLowerCase()}</option>)}
                  </select>
                </label>
              </div>
              <label className="drum-toolbar-kit">
                <span>KIT</span>
                <select value={kitId} onChange={(event) => setKitId(event.target.value)}>
                  {KITS.map((kit) => <option key={kit.id} value={kit.id}>{kit.name}</option>)}
                </select>
              </label>
              <label className="drum-toolbar-bpm">
                <span>BPM</span>
                <input type="number" min="40" max="240" value={tempo} onChange={(event) => setTempo(Math.max(40, Math.min(240, Number(event.target.value) || 40)))} />
                <input aria-label="Tempo slider" type="range" min="40" max="240" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
              </label>
              <span className="drum-sample-status">
                <i className={`drum-sample-dot ${samplesReady ? "ready" : ""}`} aria-hidden="true" />
                {samplesReady ? "Ready" : "Loading"}
              </span>
              <Button className="drum-toolbar-action" size="sm" variant={playing ? "primary" : "secondary"} icon={playing ? "bi-pause-fill" : "bi-play-fill"} onClick={play} title={playing ? "Pause playback" : "Play groove"} aria-label={playing ? "Pause playback" : "Play groove"} />
              <Button className="drum-toolbar-action" size="sm" icon="bi-bookmark-plus" onClick={saveGroove} title="Save groove" aria-label="Save groove" />
              <Button className="drum-toolbar-action" size="sm" icon="bi-collection-play" onClick={() => setLibraryOpen((open) => !open)} title="Groove library" aria-label="Groove library" aria-expanded={libraryOpen} />
              <Button className="drum-toolbar-action" size="sm" icon="bi-download" onClick={() => { stop(); setExportOpen(true); }} title="Download groove" aria-label="Download groove" />
            </div>
            <Button className="drum-clear" size="sm" variant="ghost" icon="bi-arrow-counterclockwise" onClick={clearPattern} title="Clear pattern" aria-label="Clear pattern">Clear</Button>
          </div>
          <DrumLibrary open={libraryOpen} onClose={() => setLibraryOpen(false)} library={library} savedGrooves={savedGrooves} onSelect={loadGroove} />
          <DrumExport open={exportOpen} onClose={() => setExportOpen(false)} onMidi={exportMidi} groove={{ pattern, tempo, bars, division, timeSignature, title: grooveName }} sampleBuffers={sampleBuffers} samplesReady={samplesReady} />
          <DrumSheet pattern={pattern} bars={bars} division={division} timeSignature={timeSignature} activeStep={activeStep} />
          <div className="drum-workspace">
            <aside className="drum-left-tools"><select aria-label="Time signature" value={`${timeSignature[0]}/${timeSignature[1]}`} onChange={(event) => changeTimeSignature(event.target.value)}>{["4/4", "3/4", "6/8", "9/8", "12/8", "5/4", "7/8"].map((value) => <option key={value}>{value}</option>)}</select><div className="drum-division-options">{NOTE_DIVISIONS.map(({ value, label, kind }) => <button key={value} className={division === value ? "active" : ""} disabled={!divisionIsCompatible(value)} onClick={() => setDivision(value)}><strong>{label}</strong><small>{kind}</small></button>)}</div><select className="drum-division-select" aria-label="Note division" value={division} onChange={(event) => setDivision(Number(event.target.value))}>{NOTE_DIVISIONS.map(({ value, label, kind }) => <option key={value} value={value} disabled={!divisionIsCompatible(value)}>{label} {kind.toLowerCase()}</option>)}</select><span className="drum-left-tool-spacer" /><button className="drum-undo" onClick={clearPattern}><i className="bi bi-arrow-counterclockwise" /> Undo</button><button className={`drum-side-play ${playing ? "is-playing" : ""}`} onClick={play} title={playing ? "Pause playback" : "Play groove"} aria-label={playing ? "Pause playback" : "Play groove"}><i className={`bi bi-${playing ? "pause-fill" : "play-fill"}`} /></button></aside>
            <div className="drum-grid-area">
              <div className="drum-grid-wrap" ref={gridWrapRef}><div className="drum-grid" style={{ "--step-count": width, "--steps-per-bar": stepsPerBar, "--bar-count": bars, "--bar-width": `${barWidth}px`, "--step-width": `${barWidth / stepsPerBar}px`, "--instrument-width": "165px" }}>
                <div className="drum-grid-head"><div className="drum-instrument-header">INSTRUMENT</div><div className="drum-grid-track">{Array.from({ length: bars }, (_, bar) => <div className="drum-bar-group drum-beats" key={bar}>{Array.from({ length: stepsPerBar }, (_, localStep) => <div key={localStep} className={`drum-beat ${localStep % gridBeatSteps === 0 ? "drum-beat-main" : ""}`}><span>{stepLabel(localStep)}</span></div>)}</div>)}</div></div>
                {INSTRUMENTS.map((instrument, index) => <div key={instrument.id} className={`drum-row ${index === 0 || index === 5 ? "drum-group-start" : ""} ${selectedInstrument === instrument.id ? "drum-row-selected" : ""}`} onMouseEnter={() => setSelectedInstrument(instrument.id)}><button className="drum-instrument" onClick={() => { setSelectedInstrument(instrument.id); sound(instrument.id); }} title={`Preview ${instrument.label}`}><span className="drum-instrument-icon"><i className={`bi ${instrument.id === "kick" ? "bi-record-circle" : instrument.id.includes("hat") || instrument.id.includes("crash") || instrument.id === "ride" ? "bi-disc" : "bi-circle"}`} /></span><span className="drum-instrument-name">{instrument.label}</span><span className="drum-short">{instrument.short}</span></button><div className="drum-grid-track">{Array.from({ length: bars }, (_, bar) => <div className="drum-bar-group drum-cells" key={bar}>{Array.from({ length: stepsPerBar }, (_, localStep) => { const step = bar * stepsPerBar + localStep; const variant = pattern[instrument.id][step]; const active = Boolean(variant); return <button key={step} className={`drum-cell ${localStep % gridBeatSteps === 0 ? "drum-cell-beat" : ""} ${active ? "drum-cell-active" : ""} ${activeStep === step ? "drum-cell-playing" : ""}`} aria-label={`${instrument.label}, step ${step + 1}, ${variant || "off"}`} aria-pressed={active} onContextMenu={(event) => { event.preventDefault(); setNoteMenu({ instrument: instrument.id, step, x: event.clientX, y: event.clientY }); }} onDoubleClick={(event) => { event.preventDefault(); setNoteMenu({ instrument: instrument.id, step, x: event.clientX, y: event.clientY }); }} onClick={() => toggleNote(instrument.id, step)}>{active && <span className={`drum-note-${variant}`}>{NOTE_SYMBOLS[instrument.id]}</span>}</button>; })}</div>)}</div></div>)}
                <div className="drum-bar-tools-row">
                  <div className="drum-bar-tools-label">BARS</div>
                  <div className="drum-grid-track">
                    {Array.from({ length: bars }, (_, bar) => (
                      <div className="drum-bar-tools drum-bar-group" key={bar}>
                        {bar === 0 ? (
                          <button className="drum-bar-insert" aria-label="Add bar before bar 1" title="Insert bar here" onClick={() => insertBar(0)}><i className="bi bi-plus-lg" /></button>
                        ) : (
                          <button className="drum-bar-delete" aria-label={`Delete bar ${bar + 1}`} title={`Delete bar ${bar + 1}`} onClick={() => removeBar(bar)}><i className="bi bi-trash3" /></button>
                        )}
                        <span>BAR {bar + 1}</span>
                        <button className="drum-bar-insert" aria-label={`Add bar after bar ${bar + 1}`} title="Insert bar here" onClick={() => insertBar(bar + 1)}><i className="bi bi-plus-lg" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div></div>
            </div>
          </div>
          {noteMenu && <div ref={noteMenuRef} className="drum-note-menu" style={{ left: Math.min(noteMenu.x, window.innerWidth - 210), top: Math.min(noteMenu.y, window.innerHeight - 350) }}>{VARIANTS[noteMenu.instrument].map((variant) => <button key={variant.id} onClick={() => setNoteVariant(noteMenu.instrument, noteMenu.step, variant.id)}>{variant.label}</button>)}</div>}
        </section>

      </main>
    </div>
  );
}
