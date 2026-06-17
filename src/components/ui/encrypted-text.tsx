import React, { useState, useEffect } from "react";

interface EncryptedTextProps {
  text: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
}

export function EncryptedText({
  text,
  encryptedClassName,
  revealedClassName,
  revealDelayMs = 50,
}: EncryptedTextProps) {
  const charset = "0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/\\";
  const [finalizedCount, setFinalizedCount] = useState(0);
  const [scrambleSeed, setScrambleSeed] = useState(0);

  // Animate the reveal progress
  useEffect(() => {
    setFinalizedCount(0);
    let iteration = 0;
    const textLength = text.length;

    const timer = setInterval(() => {
      iteration += 1;
      setFinalizedCount(iteration);
      if (iteration >= textLength) {
        clearInterval(timer);
      }
    }, revealDelayMs);

    return () => clearInterval(timer);
  }, [text, revealDelayMs]);

  // Scramble seed ticks for continuous scrambling effect
  useEffect(() => {
    if (finalizedCount >= text.length) return;
    const timer = setInterval(() => {
      setScrambleSeed((s) => s + 1);
    }, 40); // 25 fps scramble speed
    return () => clearInterval(timer);
  }, [finalizedCount, text.length]);

  const revealedPart = text.slice(0, finalizedCount);
  const remainingPart = text.slice(finalizedCount);
  const scrambledPart = remainingPart
    .split("")
    .map((char) => {
      if (char === " ") return " ";
      // Pick a pseudo-random character from the charset using the scramble seed
      const charIndex = Math.floor(Math.random() * charset.length);
      return charset[charIndex];
    })
    .join("");

  return (
    <span>
      <span className={revealedClassName}>{revealedPart}</span>
      <span className={encryptedClassName}>{scrambledPart}</span>
    </span>
  );
}
