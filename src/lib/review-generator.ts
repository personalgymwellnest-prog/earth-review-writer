import { HIGHLIGHT_OPTIONS, IMPRESSION_OPTIONS, REASON_OPTIONS } from "@/lib/survey-options";
import { SITE_NAME, STORE } from "@/lib/site-config";

export type SurveyAnswers = {
  reasons: string[]; // phrase values from REASON_OPTIONS
  highlights: string[]; // phrase values from HIGHLIGHT_OPTIONS
  impressions: string[][]; // variants (one per tone) from IMPRESSION_OPTIONS
  rating: number; // 1-5
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

type Tone = {
  openers: string[];
  reasonBridges: string[];
  closersPositive: string[];
  closersModerate: string[];
};

// The order of TONES must match the order of `variants` in IMPRESSION_OPTIONS.
const TONES: Tone[] = [
  // 1. 丁寧・フォーマル
  {
    openers: [
      "先日、{area}にある{siteName}で体験トレーニングを受けさせていただきました。",
      "{area}の{siteName}さんで体験トレーニングを受けさせていただきました。",
    ],
    reasonBridges: [
      "以前から{reason}が気になっており、思い切って申し込みました。",
      "{reason}が気になっていたこともあり、今回体験させていただくことにしました。",
    ],
    closersPositive: [
      "これから通うのがとても楽しみです。{area}でパーソナルジムをお探しの方には自信を持っておすすめできます。",
      "入会を前向きに検討しています。{area}でお探しの方にはぜひおすすめしたいです。",
    ],
    closersModerate: [
      "全体的に丁寧に対応していただけたので、今後の参考にしたいと思います。",
      "検討中の方は、まず無料カウンセリングで相談してみるのがおすすめだと思います。",
    ],
  },
  // 2. 共感・温かみ
  {
    openers: [
      "{area}にある{siteName}さんの体験トレーニングに行ってきました。",
      "思い切って{store}さんの体験トレーニングに参加してみました。",
    ],
    reasonBridges: [
      "{reason}が気になっていたのがきっかけです。",
      "ずっと{reason}が気になっていました。",
    ],
    closersPositive: [
      "{area}で自分に合うパーソナルジムを探している方には、本当におすすめしたいです。",
      "これからが楽しみです。気になっている方はぜひ一度体験してみてください。",
    ],
    closersModerate: [
      "丁寧に向き合っていただけたので、じっくり検討してみようと思います。",
      "焦らず自分のペースで考えられそうだと感じました。",
    ],
  },
  // 3. 率直・シンプル
  {
    openers: [
      "{area}にある{siteName}の体験に行ってきました。",
      "{store}さんの体験トレーニングを受けてみました。",
    ],
    reasonBridges: ["もともと{reason}が気になっていたので、良いきっかけになりました。"],
    closersPositive: [
      "{area}でパーソナルジムを探している方にはおすすめです。",
      "また行きたいと思える体験でした。",
    ],
    closersModerate: ["参考になる体験でした。"],
  },
];

function buildDraft(tone: Tone, toneIndex: number, answers: SurveyAnswers): string {
  const vars: Record<string, string> = {
    area: STORE.areaName,
    store: STORE.name,
    siteName: SITE_NAME,
    reason: answers.reasons.length > 0 ? pickOne(answers.reasons) : "",
  };

  const sentences: string[] = [];
  sentences.push(fill(pickOne(tone.openers), vars));

  if (answers.reasons.length > 0) {
    sentences.push(fill(pickOne(tone.reasonBridges), vars));
  }

  const chosenHighlights = shuffle(answers.highlights).slice(0, Math.min(2, answers.highlights.length));
  for (const highlight of chosenHighlights) {
    sentences.push(highlight.replace("__AREA__", STORE.areaName));
  }

  const chosenImpressions = shuffle(answers.impressions).slice(0, Math.min(2, answers.impressions.length));
  for (const variants of chosenImpressions) {
    sentences.push(variants[toneIndex] ?? variants[0]);
  }

  const closers = answers.rating >= 4 ? tone.closersPositive : tone.closersModerate;
  sentences.push(fill(pickOne(closers), vars));

  return sentences
    .map((sentence) => (/[。！?]$/.test(sentence) ? sentence : `${sentence}。`))
    .join("");
}

export function generateDrafts(answers: SurveyAnswers): string[] {
  return TONES.map((tone, index) => buildDraft(tone, index, answers));
}

export function resolveHighlightPhrases(labels: string[]): string[] {
  return labels
    .map((label): string | undefined => HIGHLIGHT_OPTIONS.find((option) => option.label === label)?.phrase)
    .filter((phrase): phrase is string => Boolean(phrase));
}

export function resolveReasonPhrases(labels: string[]): string[] {
  return labels
    .map((label): string | undefined => REASON_OPTIONS.find((option) => option.label === label)?.phrase)
    .filter((phrase): phrase is string => Boolean(phrase));
}

export function resolveImpressionVariants(labels: string[]): string[][] {
  return labels
    .map((label): string[] | undefined => {
      const option = IMPRESSION_OPTIONS.find((item) => item.label === label);
      return option ? [...option.variants] : undefined;
    })
    .filter((variants): variants is string[] => Boolean(variants));
}
