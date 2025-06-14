import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-6">恐竜ミニゲーム</h1>
      <Link href="/game" className="bg-green-600 text-white px-4 py-2 rounded">
        ログイン
      </Link>
    </div>
  );
}
