"use client";

import { useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { DraftCard } from "@/components/DraftCard";
import { SERVICES, SERVICE_KEYS, type ServiceKey } from "@/lib/survey-options";

type SurveyFormProps = {
  googleReviewUrls: Record<ServiceKey, string>;
};

type Stage = "form" | "submitting" | "results";

const DRAFT_LABELS = ["下書き案 1(丁寧)", "下書き案 2(温かみ)", "下書き案 3(シンプル)"];

export function SurveyForm({ googleReviewUrls }: SurveyFormProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [service, setService] = useState<ServiceKey | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [impressions, setImpressions] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<string[]>([]);

  const config = service ? SERVICES[service] : null;

  function chooseService(labels: string[]) {
    const next = SERVICE_KEYS.find((key) => SERVICES[key].label === labels[0]) ?? null;
    if (next !== service) {
      // Options differ per service, so earlier picks no longer apply.
      setReasons([]);
      setHighlights([]);
      setImpressions([]);
      setAudiences([]);
    }
    setService(next);
  }

  function validate(): string | null {
    if (!service) return "ご利用のサービスを選んでください。";
    if (highlights.length === 0) return "良かった点を1つ以上選んでください。";
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
        body: JSON.stringify({ service, reasons, highlights, impressions, audiences }),
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
    // Each service has its own Google listing, so send them to the right one.
    window.open(googleReviewUrls[service ?? "gym"], "_blank", "noopener,noreferrer");
  }

  if (stage === "results") {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl bg-accent/10 p-5 text-sm leading-relaxed text-ink">
          お好きな文章を選んで、自由に編集してからコピーしてください。「Googleの口コミを書く」を押すと口コミ投稿ページが開きます。貼り付けて投稿すれば完了です。
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
        <h2 className="font-serif text-lg text-ink">1. ご利用いただいたサービス</h2>
        <ChipGroup
          options={SERVICE_KEYS.map((key) => SERVICES[key].label)}
          selected={config ? [config.label] : []}
          onChange={chooseService}
          mode="single"
        />
      </section>

      {config && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-lg text-ink">2. 体験のきっかけ・お悩み(任意・複数選択可)</h2>
            <ChipGroup options={config.reasons.map((option) => option.label)} selected={reasons} onChange={setReasons} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-lg text-ink">3. 体験で良かったところ</h2>
            <p className="text-xs text-ink-soft">当てはまるものを選んでください(1つ以上・複数選択可)。</p>
            <ChipGroup
              options={config.highlights.map((option) => option.label)}
              selected={highlights}
              onChange={setHighlights}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-lg text-ink">4. 体験してみて感じた変化や印象(任意・複数選択可)</h2>
            <ChipGroup
              options={config.impressions.map((option) => option.label)}
              selected={impressions}
              onChange={setImpressions}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-lg text-ink">5. どんな方におすすめしたいですか?(任意・複数選択可)</h2>
            <ChipGroup options={config.audiences} selected={audiences} onChange={setAudiences} />
          </section>
        </>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={stage === "submitting"}
        className="self-start rounded-full bg-accent px-8 py-3 text-sm text-paper transition hover:bg-accent-soft disabled:opacity-60"
      >
        {stage === "submitting" ? "作成中…" : "口コミ文章を作成する"}
      </button>
    </form>
  );
}
