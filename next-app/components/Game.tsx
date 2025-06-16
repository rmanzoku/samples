"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createEmojiPhysics, TIERS, type PhysicsHandle } from "./EmojiPhysics";
import "../styles/game.css";

export default function Game() {
  const boardRef = useRef<HTMLDivElement>(null);
  const physics = useRef<PhysicsHandle | null>(null);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [over, setOver] = useState(false);
  const [nextTier, setNextTier] = useState(0);

  // daily seed rng
  const rng = useRef<() => number>(() => 0);
  useEffect(() => {
    let seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    rng.current = rand;
    setNextTier(Math.floor(rand() * 8));
  }, []);

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
    <div className="game-wrapper">
      <header className="header">
        <span>🏅 {score}</span>
        <span className="next">{TIERS[nextTier]}</span>
        <div className="progress">
          <div
            className="progress-inner"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      </header>
      <div
        ref={boardRef}
        className="board"
        onPointerDown={(e) => drop(e.nativeEvent.offsetX)}
        onTouchStart={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          drop(e.touches[0].clientX - rect.left);
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
  );
}

