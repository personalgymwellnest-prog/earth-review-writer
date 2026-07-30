"use client";

import { useState } from "react";

type DraftCardProps = {
  label: string;
  text: string;
  onOpenGoogle: (finalText: string) => void;
};

export function DraftCard({ label, text, onOpenGoogle }: DraftCardProps) {
  const [value, setValue] = useState(text);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-paper-alt p-6 shadow-[0_1px_2px_rgba(34,30,24,0.06),0_12px_28px_-18px_rgba(34,30,24,0.2)]">
      <p className="text-xs tracking-[0.2em] text-ink-soft">{label}</p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={6}
        className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink focus:border-accent focus:outline-none"
      />
      <p className="text-right text-xs text-ink-soft">{value.length}文字</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-line bg-paper px-5 py-2 text-sm text-ink transition hover:border-accent-soft"
        >
          {copied ? "コピーしました" : "コピーする"}
        </button>
        <button
          type="button"
          onClick={() => onOpenGoogle(value)}
          className="rounded-full bg-accent px-5 py-2 text-sm text-paper transition hover:bg-accent-soft"
        >
          この文章でGoogleクチコミを書く
        </button>
      </div>
    </div>
  );
}
