import { SurveyForm } from "@/components/SurveyForm";
import { GOOGLE_REVIEW_URL, SITE_NAME, STORE } from "@/lib/site-config";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-xs tracking-[0.2em] text-ink-soft">{STORE.name}</p>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">
          クチコミ投稿のご協力、ありがとうございます
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          簡単な質問にお答えいただくだけで、{SITE_NAME}の体験を振り返ったクチコミ文章の下書きを自動でお作りします。できあがった文章はご自由に編集し、Googleクチコミにそのまま貼り付けてご投稿いただけます。所要時間は1〜2分ほどです。
        </p>
      </header>

      <SurveyForm googleReviewUrl={GOOGLE_REVIEW_URL} />
    </main>
  );
}
