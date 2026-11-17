"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { loadSongLibrary } from "./services/songLibrary";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";

export default function WorshipSongsApp() {
  const [dark, setDark] = useState(false);
  const [songLibraryState, setSongLibraryState] = useState({
    songs: [],
    source: "local",
    workbookUrl: "",
    resolvedWorkbookUrl: "",
    error: "",
    isLoading: true,
  });

  useEffect(() => {
    let active = true;
    loadSongLibrary().then((result) => {
      if (active) setSongLibraryState({ ...result, isLoading: false });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.dataset.theme === "dark");
    const observer = new MutationObserver(update);
    update();
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Toaster
        richColors
        position="bottom-center"
        theme={dark ? "dark" : "light"}
        mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))", left: "16px", right: "16px" }}
        toastOptions={{ duration: 2200 }}
      />
      <RootLayout mode={dark} footerProps={{ songLibraryState }}>
        <HomePage
          songLibraryState={songLibraryState}
          setSongLibraryState={setSongLibraryState}
        />
      </RootLayout>
    </>
  );
}
