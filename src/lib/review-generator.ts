import { SERVICES, type ServiceConfig, type ServiceKey } from "@/lib/survey-options";
import { STORE } from "@/lib/site-config";

// Target length of a finished review (characters, excluding line breaks).
const TARGET_LENGTH = 195;
const MAX_LENGTH = 235;

export type SurveyAnswers = {
  reasons: string[]; // phrases
  highlights: string[]; // complete sentences
  impressions: string[][]; // per-tone sentence variants
  audiences: string[]; // e.g. "運動初心者の方"
  rating: number; // 3-5
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
  closersPositive: string[]; // use {target}, e.g. "堺市北区でピラティスをお探しの方、特に姿勢が気になる方"
  closersModerate: string[];
  fillersPositive: string[]; // optional extra sentences to reach the target length
  fillersModerate: string[];
};

// The order of TONES must match the order of `variants` in each impression
// option: [丁寧, 温かみ, シンプル]. Wording is shared by every service; the
// service-specific parts are {siteName}, {experience} and {noun}.
const TONES: Tone[] = [
  // 1. 丁寧・フォーマル
  {
    openers: [
      "先日、{area}にある{siteName}で{experience}を受けさせていただきました。",
      "{area}の{siteName}さんで{experience}を受けさせていただきました。",
    ],
    reasonBridges: [
      "以前から{reason}が気になっており、思い切って申し込みました。",
      "{reason}が気になっていたこともあり、今回体験させていただくことにしました。",
    ],
    closersPositive: [
      "これから通うのがとても楽しみです。{target}には自信を持っておすすめできます。",
      "入会を前向きに検討しています。{target}にはぜひおすすめしたいです。",
    ],
    closersModerate: [
      "全体的に丁寧に対応していただけたので、今後の参考にしたいと思います。",
      "検討中の方は、まず体験を受けてみるのがおすすめだと思います。",
    ],
    fillersPositive: [
      "体験させていただいて本当によかったです。",
      "全体を通して、充実した時間を過ごせました。",
      "{area}で{noun}を探している方の参考になれば嬉しいです。",
    ],
    fillersModerate: [
      "実際に体験することで、具体的なイメージを持つことができました。",
      "{area}で{noun}を検討している方の参考になれば幸いです。",
    ],
  },
  // 2. 共感・温かみ
  {
    openers: [
      "{area}にある{siteName}さんの{experience}に行ってきました。",
      "思い切って{store}さんの{experienceFull}に参加してみました。",
    ],
    reasonBridges: [
      "{reason}が気になっていたのがきっかけです。",
      "ずっと{reason}が気になっていました。",
    ],
    closersPositive: [
      "{target}には、本当におすすめしたいです。",
      "これからが楽しみです。{target}は、ぜひ一度体験してみてください。",
    ],
    closersModerate: [
      "丁寧に向き合っていただけたので、じっくり検討してみようと思います。",
      "焦らず自分のペースで考えられそうだと感じました。",
    ],
    fillersPositive: [
      "体験してみて本当によかったなと思います。",
      "あっという間に時間が過ぎていきました。",
      "{area}で{noun}を探している方の参考になればと思い、投稿しました。",
    ],
    fillersModerate: [
      "実際に体験してみることで、イメージが湧きました。",
      "{area}で{noun}を検討している方の参考になればと思い、投稿しました。",
    ],
  },
  // 3. 率直・シンプル
  {
    openers: [
      "{area}にある{siteName}の{experience}に行ってきました。",
      "{store}さんの{experienceFull}を受けてみました。",
    ],
    reasonBridges: ["もともと{reason}が気になっていたので、良いきっかけになりました。"],
    closersPositive: [
      "{target}におすすめです。",
      "また行きたいと思える体験でした。{target}にぜひ。",
    ],
    closersModerate: ["参考になる体験でした。"],
    fillersPositive: [
      "体験してよかったです。",
      "全体的に満足です。",
      "{area}で{noun}を探している方の参考になれば。",
    ],
    fillersModerate: [
      "実際に体験できてよかったです。",
      "{area}で{noun}を検討している方の参考になれば。",
    ],
  },
];

function joinAudiences(audiences: string[]): string {
  return audiences.slice(0, 2).join("や、");
}

const textLength = (parts: string[]) => parts.reduce((sum, part) => sum + part.length, 0);

function buildDraft(service: ServiceConfig, tone: Tone, toneIndex: number, answers: SurveyAnswers): string {
  const vars: Record<string, string> = {
    area: STORE.areaName,
    store: STORE.name,
    siteName: service.siteName,
    experience: service.experience,
    experienceFull: service.experienceFull,
    noun: service.noun,
    reason: answers.reasons.length > 0 ? pickOne(answers.reasons) : "",
    target: "",
  };
  const audience = joinAudiences(shuffle(answers.audiences));
  vars.target = `${STORE.areaName}で${service.noun}をお探しの方${audience ? `、特に${audience}` : ""}`;
  const toSentence = (text: string) => (/[。！？!?]$/.test(text) ? text : `${text}。`);
  const positive = answers.rating >= 4;

  const intro = [toSentence(fill(pickOne(tone.openers), vars))];
  if (answers.reasons.length > 0) {
    intro.push(toSentence(fill(pickOne(tone.reasonBridges), vars)));
  }
  const outro = [toSentence(fill(pickOne(positive ? tone.closersPositive : tone.closersModerate), vars))];

  const highlights = shuffle(answers.highlights).map((text) =>
    toSentence(text.replace("__AREA__", STORE.areaName))
  );
  const impressions = shuffle(answers.impressions).map((variants) =>
    toSentence(variants[toneIndex] ?? variants[0])
  );

  // At least one highlight is always used; then add more details (alternating
  // highlight / impression) until the review is close to the target length,
  // skipping anything that would push it past the maximum.
  const body = [highlights[0]];
  const feel: string[] = [];
  const optional: { text: string; kind: "body" | "feel" }[] = [];
  for (let i = 0; i < Math.max(highlights.length, impressions.length); i++) {
    if (i < impressions.length) optional.push({ text: impressions[i], kind: "feel" });
    if (i + 1 < highlights.length) optional.push({ text: highlights[i + 1], kind: "body" });
  }
  for (const fillerText of shuffle(positive ? tone.fillersPositive : tone.fillersModerate)) {
    optional.push({ text: toSentence(fill(fillerText, vars)), kind: "feel" });
  }

  const total = () => textLength([...intro, ...body, ...feel, ...outro]);
  for (const item of optional) {
    if (total() >= TARGET_LENGTH) break;
    if (total() + item.text.length > MAX_LENGTH) continue;
    (item.kind === "body" ? body : feel).push(item.text);
  }

  // Paragraphs separated by a blank line keep a ~200 character review easy to read.
  return [intro, body, feel, outro]
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => paragraph.join(""))
    .join("\n\n");
}

export function generateDrafts(serviceKey: ServiceKey, answers: SurveyAnswers): string[] {
  const service = SERVICES[serviceKey];
  return TONES.map((tone, index) => buildDraft(service, tone, index, answers));
}

export function resolveHighlightPhrases(serviceKey: ServiceKey, labels: string[]): string[] {
  const options = SERVICES[serviceKey].highlights;
  return labels
    .map((label): string | undefined => options.find((option) => option.label === label)?.phrase)
    .filter((phrase): phrase is string => Boolean(phrase));
}

export function resolveReasonPhrases(serviceKey: ServiceKey, labels: string[]): string[] {
  const options = SERVICES[serviceKey].reasons;
  return labels
    .map((label): string | undefined => options.find((option) => option.label === label)?.phrase)
    .filter((phrase): phrase is string => Boolean(phrase));
}

export function resolveImpressionVariants(serviceKey: ServiceKey, labels: string[]): string[][] {
  const options = SERVICES[serviceKey].impressions;
  return labels
    .map((label): string[] | undefined => {
      const option = options.find((item) => item.label === label);
      return option ? [...option.variants] : undefined;
    })
    .filter((variants): variants is string[] => Boolean(variants));
}
