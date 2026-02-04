"use client";

import { useLayoutEffect, useState } from "react";

export default function TypingText({ text, speed = 40 }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useLayoutEffect(() => {
    if (index >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayed(prev => prev + text.charAt(index));
      setIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, text, speed]);

  return <p className="home-description">{displayed}</p>;
}
