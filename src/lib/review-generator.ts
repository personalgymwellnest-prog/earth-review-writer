import { HIGHLIGHT_OPTIONS, REASON_OPTIONS } from "@/lib/survey-options";
import { SITE_NAME, STORE } from "@/lib/site-config";

export type SurveyAnswers = {
  course: string;
  reasons: string[]; // phrase values from REASON_OPTIONS
  highlights: string[]; // phrase values from HIGHLIGHT_OPTIONS
  trainerName?: string;
  impression?: string;
  rating: number; // 1-5
  note?: string;
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
  reasonBridges: string[] | null; // null = reason is folded into the opener instead
  trainerLines: string[];
  impressionLines: string[];
  closersPositive: string[];
  closersModerate: string[];
};

const TONES: Tone[] = [
  // 1. 丁寧・フォーマル
  {
    openers: [
      "先日、{area}にある{siteName}で{course}を受けさせていただきました。",
      "{area}の{siteName}さんで{course}を体験させていただきました。",
    ],
    reasonBridges: [
      "以前から{reason}が気になっており、思い切って申し込みました。",
      "{reason}が気になっていたこともあり、今回体験させていただくことにしました。",
    ],
    trainerLines: [
      "担当していただいた{trainerName}トレーナーには、丁寧に対応していただきました。",
      "{trainerName}トレーナーの説明がとてもわかりやすく、安心して受けることができました。",
    ],
    impressionLines: [
      "体験後は、{impression}と感じました。",
      "実際に受けてみて、{impression}という印象を持ちました。",
    ],
    closersPositive: [
      "これから通うのがとても楽しみです。{area}でパーソナルジムをお探しの方には自信を持っておすすめできます。",
      "無理なく続けられそうだと感じたので、入会を前向きに検討しています。{area}でお探しの方にはぜひおすすめしたいです。",
    ],
    closersModerate: [
      "全体的に丁寧に対応していただけたので、今後の参考にしたいと思います。",
      "検討中の方は、まず無料カウンセリングで相談してみるのがおすすめだと思います。",
    ],
  },
  // 2. 共感・温かみ
  {
    openers: [
      "{area}にある{siteName}さんの{course}を体験してきました。",
      "思い切って{store}さんの{course}に参加してみました。",
    ],
    reasonBridges: [
      "{reason}が気になっていたのがきっかけです。",
      "ずっと{reason}が気になっていました。",
    ],
    trainerLines: [
      "{trainerName}トレーナーがとても親身に対応してくださって、緊張がほぐれました。",
      "{trainerName}トレーナーの人柄も温かく、通うのが楽しみになりました。",
    ],
    impressionLines: [
      "実際に体験してみて、{impression}と感じられたのが嬉しかったです。",
      "{impression}という変化を感じられて、続けてみたいと思いました。",
    ],
    closersPositive: [
      "{area}で自分に合うパーソナルジムを探している方には、本当におすすめしたいです。",
      "無理なく続けられそうな雰囲気だったので、これからが楽しみです。",
    ],
    closersModerate: [
      "丁寧に向き合っていただけたので、じっくり検討してみようと思います。",
      "焦らず自分のペースで考えられそうだと感じました。",
    ],
  },
  // 3. 率直・シンプル
  {
    openers: [
      "{area}にある{siteName}の{course}に行ってきました。",
      "{store}さんの{course}を受けてみました。",
    ],
    reasonBridges: ["もともと{reason}が気になっていたので、良いきっかけになりました。"],
    trainerLines: [
      "{trainerName}トレーナーが丁寧に教えてくれました。",
      "{trainerName}トレーナーの説明がわかりやすかったです。",
    ],
    impressionLines: ["{impression}と感じました。"],
    closersPositive: [
      "{area}でパーソナルジムを探している方にはおすすめです。",
      "続けてみようと思える体験でした。",
    ],
    closersModerate: ["参考になる体験でした。"],
  },
];

function buildDraft(tone: Tone, answers: SurveyAnswers): string {
  const vars: Record<string, string> = {
    area: STORE.areaName,
    store: STORE.name,
    siteName: SITE_NAME,
    course: answers.course,
    reason: answers.reasons.length > 0 ? pickOne(answers.reasons) : "",
    trainerName: answers.trainerName ?? "",
    impression: answers.impression ?? "",
  };

  const sentences: string[] = [];
  sentences.push(fill(pickOne(tone.openers), vars));

  if (tone.reasonBridges && answers.reasons.length > 0) {
    sentences.push(fill(pickOne(tone.reasonBridges), vars));
  }

  const chosenHighlights = shuffle(answers.highlights).slice(0, Math.min(2, answers.highlights.length));
  for (const highlight of chosenHighlights) {
    sentences.push(highlight.replace("__AREA__", STORE.areaName));
  }

  if (answers.trainerName) {
    sentences.push(fill(pickOne(tone.trainerLines), vars));
  }

  if (answers.impression) {
    sentences.push(fill(pickOne(tone.impressionLines), vars));
  }

  const closers = answers.rating >= 4 ? tone.closersPositive : tone.closersModerate;
  sentences.push(fill(pickOne(closers), vars));

  if (answers.note) {
    const note = answers.note.trim();
    sentences.push(note.endsWith("。") || note.endsWith("！") || note.endsWith("!") ? note : `${note}。`);
  }

  return sentences
    .map((sentence) => (/[。！?]$/.test(sentence) ? sentence : `${sentence}。`))
    .join("");
}

export function generateDrafts(answers: SurveyAnswers): string[] {
  return TONES.map((tone) => buildDraft(tone, answers));
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
