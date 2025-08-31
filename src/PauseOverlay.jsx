import React from "react";
import { motion } from "framer-motion";

export default function PauseOverlay({ isPaused, onResume }) {
  if (!isPaused) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-40"
    >
      <div className="glass p-6 text-center max-w-sm">
        <h2 className="text-2xl font-semibold mb-2">Paused</h2>
        <p className="text-slate-300 mb-4">Take a breath. Ready to jump back in?</p>
        <button className="btn-primary" onClick={onResume}>Resume</button>
      </div>
    </motion.div>
  );
}
