import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/mock-leaderboard.json")
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Leaderboard (Mock)</h3>
        <span className="text-xs text-slate-400">stubbed JSON</span>
      </div>
      <ul className="space-y-1">
        {items.map((it, idx) => (
          <li key={idx} className="flex justify-between text-sm bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <span>{idx + 1}. {it.name}</span>
            <span className="font-semibold">{it.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
