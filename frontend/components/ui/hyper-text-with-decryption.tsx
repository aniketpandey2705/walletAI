"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
const SCRAMBLE_SPEED = 10;
const CYCLES_PER_LETTER = 3;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";

interface HyperTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  style?: React.CSSProperties;
}

interface WordProps {
  children: string;
  isDimmed: boolean;
  isHighlightable: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const Word = ({
  children,
  isDimmed,
  isHighlightable,
  onHoverStart,
  onHoverEnd,
}: WordProps) => {
  const [displayText, setDisplayText] = useState(children);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const scramble = useCallback(() => {
    let pos = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const scrambled = children
        .split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) return char;
          const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          return randomChar;
        })
        .join("");

      setDisplayText(scrambled);
      pos++;

      if (pos >= children.length * CYCLES_PER_LETTER) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(children);
      }
    }, SCRAMBLE_SPEED);
  }, [children]);

  const stopScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(children);
  }, [children]);

  const handleMouseEnter = () => {
    if (isHighlightable) {
      setIsHovered(true);
      onHoverStart();
      scramble();
    }
  };

  const handleMouseLeave = () => {
    if (isHighlightable) {
      setIsHovered(false);
      onHoverEnd();
      stopScramble();
    }
  };

  return (
    <motion.span
      className={`
        relative inline-block font-sans font-bold whitespace-nowrap
        ${isHighlightable ? "cursor-pointer" : "cursor-default"}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? 1.05 : 1,
        y: isHovered ? -4 : 0,
        opacity: isDimmed && !isHovered ? 0.3 : 1,
        filter: isDimmed && !isHovered ? "blur(2px)" : "blur(0px)",
        ...(isHighlightable ? { color: isHovered ? "#FFFFFF" : "#60A5FA" } : {}),
        zIndex: isHovered ? 20 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute -inset-2 rounded-lg bg-blue-500/20 z-[-1]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layoutId="hover-bg"
            style={{
              boxShadow: "0px 10px 25px -5px rgba(37, 99, 235, 0.4)",
            }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 px-1">{displayText}</span>

      <AnimatePresence>
        {isHovered && (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full z-20 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
            />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full z-20 shadow-[0_0_8px_rgba(244,114,182,0.8)]"
            />
          </>
        )}
      </AnimatePresence>
    </motion.span>
  );
};

export default function HyperTextParagraph({
  text,
  className = "",
  highlightWords = [],
  style = {},
}: HyperTextProps) {
  const [isParagraphHovered, setIsParagraphHovered] = useState(false);

  const words = text.split(" ");

  const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

  return (
    <div className={`${className}`} style={style}>
      {words.map((word, i) => {
        const isHighlightable = highlightWords.some(
          (hw) => clean(hw) === clean(word)
        );

        return (
          <React.Fragment key={i}>
            <Word
              isDimmed={isParagraphHovered}
              isHighlightable={isHighlightable}
              onHoverStart={() => setIsParagraphHovered(true)}
              onHoverEnd={() => setIsParagraphHovered(false)}
            >
              {word}
            </Word>
            <span className="inline-block whitespace-pre"> </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
