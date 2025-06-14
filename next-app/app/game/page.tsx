"use client";
import { useState } from "react";
import Link from "next/link";

export default function GamePage() {
  const [launched, setLaunched] = useState(false);
  const reset = () => setLaunched(false);
  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center relative bg-green-50 p-4">
      <div className="absolute top-2 left-2">
        <Link href="/" className="underline">&larr; 戻る</Link>
      </div>
      <div className="relative w-full h-64 border rounded bg-white flex items-end justify-start overflow-hidden">
        {/* Slingshot */}
        <span className="absolute bottom-4 left-4 text-3xl">🏹</span>
        {/* Bird projectile */}
        <span
          className={`absolute bottom-12 left-10 text-3xl transition-transform duration-700 ${launched ? 'translate-x-40 -translate-y-24' : ''}`}
        >🐦</span>
        {/* Dinosaur target */}
        <span className="absolute bottom-4 right-4 text-4xl">🦖</span>
      </div>
      <button
        onClick={() => setLaunched(true)}
        disabled={launched}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
      >
        発射！
      </button>
      {launched && (
        <button onClick={reset} className="mt-2 underline text-sm">もう一度</button>
      )}
    </div>
  );
}
