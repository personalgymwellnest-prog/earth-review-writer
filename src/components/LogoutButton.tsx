"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="rounded-full border border-line bg-paper-alt px-4 py-2 text-xs text-ink-soft transition hover:border-accent-soft"
    >
      ログアウト
    </button>
  );
}
