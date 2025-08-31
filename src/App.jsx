import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameHUD from "./GameHUD.jsx";
import PauseOverlay from "./PauseOverlay.jsx";
import Leaderboard from "./Leaderboard.jsx";
import Target from "./Target.jsx";

// Utility: use stable interval that respects pause
function useGameTimer(active, intervalMs, cb) {
  const savedCb = useRef(cb);
  useEffect(() => { savedCb.current = cb; }, [cb]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => savedCb.current?.(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}

// Simple beep with WebAudio (no assets required)
function useBeep() {
  const ctxRef = useRef(null);
  const ensureCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };
  return (freq = 880, duration = 0.06) => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); }, duration * 1000);
  };
}

const START_LIVES = 3;
const TARGET_BASE_SIZE = 72; // px
const TARGET_MIN_SIZE = 36;
const BASE_TIME = 2.0; // seconds to click at round 1

export default function App() {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("bestScore") || 0));
  const [lives, setLives] = useState(START_LIVES);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME);
  const [boardSize, setBoardSize] = useState({ w: 640, h: 360 });
  const boardRef = useRef(null);
  const appearKeyRef = useRef(0);
  const [target, setTarget] = useState({ x: 100, y: 100, size: TARGET_BASE_SIZE });

  const beep = useBeep();

  // Difficulty scaling: time shrinks, target shrinks, also random movement
  const timePerRound = useMemo(() => Math.max(0.6, BASE_TIME - (round - 1) * 0.12), [round]);
  const targetSize = useMemo(() => Math.max(TARGET_MIN_SIZE, TARGET_BASE_SIZE - (round - 1) * 4), [round]);

  // Resize observer to keep board bounds
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setBoardSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spawnTarget = () => {
    // Keep inside padding
    const pad = 12;
    const x = Math.random() * (boardSize.w - targetSize - pad * 2) + pad;
    const y = Math.random() * (boardSize.h - targetSize - pad * 2) + pad;
    appearKeyRef.current += 1;
    setTarget({ x, y, size: targetSize });
  };

  const resetRound = () => {
    setTimeLeft(timePerRound);
    spawnTarget();
  };

  const startGame = () => {
    setScore(0);
    setLives(START_LIVES);
    setRound(1);
    setPaused(false);
    setRunning(true);
  };

  const restartGame = () => {
    startGame();
  };

  const endGame = () => {
    setRunning(false);
    setPaused(false);
    setRound(1);
    setTimeLeft(BASE_TIME);
    // save best
    if (score > best) {
      localStorage.setItem("bestScore", String(score));
      setBest(score);
    }
  };

  // Timer tick (100ms granularity for smoothness)
  useGameTimer(running && !paused, 100, () => {
    setTimeLeft((t) => {
      const nt = Math.max(0, t - 0.1);
      if (nt === 0) {
        // Missed target
        setLives((lv) => {
          const nl = lv - 1;
          if (nl <= 0) {
            beep(200, 0.15);
            endGame();
          } else {
            beep(300, 0.08);
            // Next round after penalty
            setRound((r) => r + 1);
            setTimeout(resetRound, 120);
          }
          return nl;
        });
      }
      return nt;
    });
  });

  // When round changes (due to success), refresh timer and spawn new target
  useEffect(() => {
    if (running) {
      setTimeLeft(timePerRound);
      spawnTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, running]);

  const onHit = () => {
    if (!running || paused) return;
    beep(1200, 0.05);
    setScore((s) => s + 1);
    setRound((r) => r + 1);
  };

  const togglePause = () => setPaused((p) => !p);

  // Initial spawn when starting
  useEffect(() => {
    if (running) resetRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const gameOver = !running && (score > 0 || lives !== START_LIVES);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Reaction Speed
            </span>{" "}
            <span className="text-slate-400 text-lg font-normal">click the target before time runs out</span>
          </h1>
          <div className="flex items-center gap-2">
            {!running ? (
              <button className="btn-primary" onClick={startGame}>Start</button>
            ) : (
              <button className="btn-ghost" onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
            )}
            <button className="btn-ghost" onClick={restartGame}>Restart</button>
          </div>
        </header>

        <GameHUD
          score={score}
          best={best}
          round={round}
          lives={lives}
          timeLeft={timeLeft}
          isPaused={paused}
          onPause={togglePause}
        />

        <div
          ref={boardRef}
          className="relative aspect-[16/9] w-full glass overflow-hidden grid place-items-center"
        >
          {!running && !gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6"
            >
              <p className="text-slate-300 mb-4">
                Click the glowing orb before the timer hits zero. Each round gets faster and the target smaller.
              </p>
              <div className="flex gap-2 justify-center">
                <button className="btn-primary" onClick={startGame}>Play</button>
              </div>
            </motion.div>
          )}

          {running && (
            <>
              <AnimatePresence>
                <motion.div
                  key={round}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Target
                    x={target.x}
                    y={target.y}
                    size={target.size}
                    onClick={onHit}
                    appearKey={round}
                  />
                </motion.div>
              </AnimatePresence>

              {paused && <PauseOverlay isPaused={paused} onResume={() => setPaused(false)} />}
            </>
          )}

          {gameOver && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6"
            >
              <h2 className="text-2xl font-semibold mb-2">Game Over</h2>
              <p className="text-slate-300 mb-1">Final Score: <strong className="text-white">{score}</strong></p>
              <p className="text-slate-400 mb-4">
                {score >= best ? "New best! Nicely done." : `Best: ${best}`}
              </p>
              <div className="flex gap-2 justify-center">
                <button className="btn-primary" onClick={restartGame}>Play Again</button>
              </div>
            </motion.div>
          )}
        </div>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="glass p-4">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-300">
              <li>Hit the target before time runs out.</li>
              <li>Each round speeds up and shrinks the target.</li>
              <li>Miss a round → lose a life. Lose all lives → game over.</li>
              <li>Your best score is saved in your browser.</li>
            </ul>
          </div>
          <Leaderboard />
        </section>

        <footer className="text-center text-xs text-slate-500 pt-2">
          Built with React, Tailwind, and Framer Motion.
        </footer>
      </div>
    </div>
  );
}

