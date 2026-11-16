// `phrase` is the noun form used when the generator drops it into a sentence
// (e.g. "運動不足が気になっていて…"). `label` is what the chip shows.
export const REASON_OPTIONS = [
  { label: "運動不足を感じていた", phrase: "運動不足" },
  { label: "ダイエット・体型の変化が気になった", phrase: "体型の変化" },
  { label: "姿勢や腰・肩の不調が気になった", phrase: "姿勢や腰・肩の不調" },
  { label: "産後の体型をケアしたかった", phrase: "産後の体型の変化" },
  { label: "健康診断がきっかけだった", phrase: "健康診断の結果" },
  { label: "筋力・体力の維持がしたかった", phrase: "体力・筋力の衰え" },
] as const;

// `phrase` is a complete polite sentence (ending in 。) the generator can
// drop in as-is between other sentences.
export const HIGHLIGHT_OPTIONS = [
  {
    label: "トレーナーの説明がわかりやすかった",
    phrase: "トレーナーさんの説明がとても丁寧でわかりやすかったです。",
  },
  {
    label: "トレーナーが親身に対応してくれた",
    phrase: "トレーナーさんが親身に話を聞いてくれて、安心して相談できました。",
  },
  {
    label: "雰囲気が良くリラックスできた",
    phrase: "スタジオの雰囲気が落ち着いていて、リラックスして受けられました。",
  },
  {
    label: "無理なく体を動かせた",
    phrase: "運動が得意ではない私でも、無理なく体を動かすことができました。",
  },
  {
    label: "清潔感があった",
    phrase: "店内はとても清潔感があり、気持ちよく過ごせました。",
  },
  {
    label: "アクセス・立地が良かった",
    phrase: "__AREA__という立地もあり、通いやすいと感じました。",
  },
  {
    label: "料金プランがわかりやすかった",
    phrase: "料金プランについても丁寧に説明してもらえて、安心して決められました。",
  },
  {
    label: "自分に合ったメニューを考えてくれた",
    phrase: "自分の体力や目的に合わせて、メニューを考えてくれました。",
  },
] as const;

// Each impression has one complete sentence per tone, in the same order as
// TONES in review-generator.ts: [丁寧, 温かみ, シンプル].
export const IMPRESSION_OPTIONS = [
  {
    label: "体が軽くなった気がした",
    variants: [
      "体験後は、体が軽くなったように感じました。",
      "終わったあとに体がふわっと軽くなった気がして、嬉しくなりました。",
      "体が軽くなった気がしました。",
    ],
  },
  {
    label: "続けられそうだと思った",
    variants: [
      "無理なく続けられそうだと感じました。",
      "これなら自分のペースで続けられそうだと思えました。",
      "続けられそうだと思いました。",
    ],
  },
  {
    label: "運動への不安が減った",
    variants: [
      "運動に対する不安が和らぎ、前向きな気持ちになりました。",
      "運動が苦手でも大丈夫なんだと、不安が軽くなりました。",
      "運動への不安が減りました。",
    ],
  },
  {
    label: "やる気が出た",
    variants: [
      "体験を通して、目標に向けて頑張ろうという意欲が湧きました。",
      "気持ちが前向きになって、頑張ろうというやる気が出ました。",
      "やる気が出ました。",
    ],
  },
] as const;
