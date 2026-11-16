"use client";

import { useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { StarRating } from "@/components/StarRating";
import { DraftCard } from "@/components/DraftCard";
import { HIGHLIGHT_OPTIONS, IMPRESSION_OPTIONS, REASON_OPTIONS } from "@/lib/survey-options";

type SurveyFormProps = {
  googleReviewUrl: string;
};

type Stage = "form" | "submitting" | "results";

const DRAFT_LABELS = ["下書き案 1(丁寧)", "下書き案 2(温かみ)", "下書き案 3(シンプル)"];

export function SurveyForm({ googleReviewUrl }: SurveyFormProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [reasons, setReasons] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [impressions, setImpressions] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<string[]>([]);

  function validate(): string | null {
    if (highlights.length === 0) return "良かった点を1つ以上選んでください。";
    if (rating === 0) return "総合満足度を選んでください。";
    if (!consent) return "内容が実際の体験に基づくことの確認にチェックしてください。";
    return null;
  }

  async function submit(payload?: { reuseAnswers: boolean }) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStage("submitting");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasons, highlights, impressions, rating }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "文章の作成に失敗しました。もう一度お試しください。");
        setStage("form");
        return;
      }
      setSubmissionId(data.id);
      setDrafts(data.drafts);
      setStage("results");
      if (!payload?.reuseAnswers) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setStage("form");
    }
  }

  async function handleOpenGoogle(finalText: string) {
    if (submissionId) {
      fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, chosenDraft: finalText, postedToGoogle: true }),
      }).catch(() => {});
    }
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  if (stage === "results") {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl bg-accent/10 p-5 text-sm leading-relaxed text-ink">
          お好きな文章を選んで、自由に編集してからコピーしてください。「Googleクチコミを書く」を押すとクチコミ投稿ページが開きます。貼り付けて投稿すれば完了です。
        </div>
        {drafts.map((draft, index) => (
          <DraftCard key={index} label={DRAFT_LABELS[index] ?? `下書き案 ${index + 1}`} text={draft} onOpenGoogle={handleOpenGoogle} />
        ))}
        <button
          type="button"
          onClick={() => submit({ reuseAnswers: true })}
          className="self-start rounded-full border border-line bg-paper-alt px-5 py-2 text-sm text-ink-soft transition hover:border-accent-soft hover:text-ink"
        >
          別の文章パターンを作り直す
        </button>
        <button
          type="button"
          onClick={() => setStage("form")}
          className="self-start text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          アンケートの内容を修正する
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-10"
    >
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-ink">1. 体験のきっかけ・お悩み(任意・複数選択可)</h2>
        <ChipGroup options={REASON_OPTIONS.map((option) => option.label)} selected={reasons} onChange={setReasons} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-ink">2. 体験で良かったところ</h2>
        <p className="text-xs text-ink-soft">当てはまるものを選んでください(1つ以上・複数選択可)。</p>
        <ChipGroup
          options={HIGHLIGHT_OPTIONS.map((option) => option.label)}
          selected={highlights}
          onChange={setHighlights}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-ink">3. 体験してみて感じた変化や印象(任意・複数選択可)</h2>
        <ChipGroup
          options={IMPRESSION_OPTIONS.map((option) => option.label)}
          selected={impressions}
          onChange={setImpressions}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-ink">4. 総合満足度</h2>
        <StarRating value={rating} onChange={setRating} />
      </section>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
        />
        選んだ内容は、実際に自分が体験して感じたことに基づきます。
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={stage === "submitting"}
        className="self-start rounded-full bg-accent px-8 py-3 text-sm text-paper transition hover:bg-accent-soft disabled:opacity-60"
      >
        {stage === "submitting" ? "作成中…" : "クチコミ文章を作成する"}
      </button>
    </form>
  );
}
