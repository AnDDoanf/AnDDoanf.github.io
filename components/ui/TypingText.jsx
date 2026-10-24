"use client";

import { useLayoutEffect, useState } from "react";

export default function TypingText({
  text = "",
  speed = 40,
  className = "home-description",
}) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  // Reset animation if the text changes (e.g. language or prop change)
  useLayoutEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [text]);

  useLayoutEffect(() => {
    if (index >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      setIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, text, speed]);

  return <p className={className}>{displayed}</p>;
}
