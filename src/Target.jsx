import React from "react";
import { motion } from "framer-motion";

export default function Target({ x, y, size, onClick, appearKey }) {
  const style = {
    left: x,
    top: y,
    width: size,
    height: size
  };
  return (
    <motion.button
      key={appearKey}
      initial={{ scale: 0, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 15 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="absolute rounded-full bg-red-400 shadow-glow focus:outline-none ring-4 ring-red-400/30 hover:shadow-[0_0_0_8px_rgba(56,189,248,0.15)]"
      style={style}
      aria-label="target"
      onClick={onClick}
    />
  );
}
