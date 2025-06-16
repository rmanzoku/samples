"use client";
export const dynamic = "force-dynamic";
import dynamicFn from "next/dynamic";

const Game = dynamicFn(() => import("@/components/Game"), { ssr: false });

export default function GamePage() {
  return <Game />;
}

