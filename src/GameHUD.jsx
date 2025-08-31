import React from "react";

export default function GameHUD({ score, best, round, lives, timeLeft, isPaused, onPause }) {
  return (
    <div className="glass p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="badge">Round <strong>{round}</strong></span>
        <span className="badge">Score <strong>{score}</strong></span>
        <span className="badge">Best <strong>{best}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <span className="badge">Lives <strong>{lives}</strong></span>
        <span className="badge">Time <strong>{timeLeft.toFixed(1)}s</strong></span>
        <button className="btn-ghost" onClick={onPause}>{isPaused ? "Resume" : "Pause"}</button>
      </div>
    </div>
  );
}
