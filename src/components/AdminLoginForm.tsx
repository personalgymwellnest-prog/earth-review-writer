"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok || !data.ok) {
      setError(data.error ?? "ログインに失敗しました。");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 py-24">
      <h1 className="font-serif text-xl text-ink">管理者ログイン</h1>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="パスワード"
        className="w-full rounded-xl border border-line bg-paper-alt px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-accent px-6 py-3 text-sm text-paper transition hover:bg-accent-soft disabled:opacity-60"
      >
        {loading ? "確認中…" : "ログイン"}
      </button>
    </form>
  );
}
