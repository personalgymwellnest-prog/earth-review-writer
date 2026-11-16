import { SurveyForm } from "@/components/SurveyForm";
import { GOOGLE_REVIEW_URLS, STORE } from "@/lib/site-config";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-xs tracking-[0.2em] text-ink-soft">{STORE.name}</p>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">
          口コミ投稿のご協力、ありがとうございます
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          当てはまる項目を選ぶだけで、体験の感想をまとめた口コミ文章の下書きを自動でお作りします。できあがった文章はご自由に編集し、Googleの口コミにそのまま貼り付けてご投稿いただけます。所要時間は1分ほどです。
        </p>
      </header>

      <SurveyForm googleReviewUrls={GOOGLE_REVIEW_URLS} />
    </main>
  );
}
