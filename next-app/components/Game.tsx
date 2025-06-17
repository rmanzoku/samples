"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createEmojiPhysics, TIERS, type PhysicsHandle } from "./EmojiPhysics";
import "../styles/game.css";

const BEST_KEY = "suika-best";

export default function Game() {
  const boardRef = useRef<HTMLDivElement>(null);
  const physics = useRef<PhysicsHandle | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [progress, setProgress] = useState(0);
  const [over, setOver] = useState(false);
  const [nextTier, setNextTier] = useState(0);

  // daily seed rng
  const rng = useRef<() => number>(() => 0);
  useEffect(() => {
    setBest(Number(localStorage.getItem(BEST_KEY) || 0));
    let seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    rng.current = rand;
    setNextTier(Math.floor(rand() * 8));
  }, []);

  // update best score when game over
  useEffect(() => {
    if (over) {
      setBest((b) => {
        const next = Math.max(b, score);
        localStorage.setItem(BEST_KEY, String(next));
        return next;
      });
    }
  }, [over, score]);

  useEffect(() => {
    if (!boardRef.current) return;
    createEmojiPhysics(
      boardRef.current,
      (tier) => {
        setScore((s) => s + 10 * tier + 50);
        if (navigator.vibrate) navigator.vibrate(30);
      },
      () => setOver(true)
    ).then((h) => {
      physics.current = h;
      h.start();
    });
    return () => physics.current?.cleanup();
  }, []);

  // animation update
  useEffect(() => {
    let id = 0;
    const step = () => {
      if (physics.current) {
        physics.current.update();
        setProgress(physics.current.getHeight());
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  const drop = (x: number) => {
    if (!physics.current || over) return;
    const tier = nextTier;
    setScore((s) => s + 10 * tier);
    physics.current.drop(tier, x);
    setNextTier(Math.floor(rng.current() * 8));
  };

  const reset = () => {
    physics.current?.cleanup();
    setScore(0);
    setOver(false);
    setNextTier(Math.floor(rng.current() * 8));
    if (boardRef.current) {
      createEmojiPhysics(
        boardRef.current,
        (tier) => {
          setScore((s) => s + 10 * tier + 50);
          if (navigator.vibrate) navigator.vibrate(30);
        },
        () => setOver(true)
      ).then((h) => {
        physics.current = h;
        h.start();
      });
    }
  };

  return (
    <div className="suika-game">
      <div className="game-wrapper">
        <div className="scoreboard">
          <div className="bubble bubble--best">{best}</div>
          <div className="bubble bubble--score">{score}</div>
          <div className="bubble bubble--next">
            <span className="icon">{TIERS[nextTier]}</span>
          </div>
        </div>
        <div className="progress">
          <div
            className="progress-inner"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
        <div
          ref={boardRef}
          className="board glass-box"
          onPointerDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // Use pointer events for both mouse and touch to avoid duplicate
            // drops that can occur when `touchstart` and `pointerdown` fire
            // together on mobile browsers.
            drop(e.clientX - rect.left);
          }}
        />
      {over && (
        <div className="modal">
          <p className="mb-2">Score: {score}</p>
          <button onClick={reset} className="mb-2">Restart</button>
        </div>
      )}
        <footer className="footer">
          © <Link href="/">Home</Link>
        </footer>
      </div>
    </div>
  );
}

