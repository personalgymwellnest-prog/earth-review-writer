export type ServiceKey = "gym" | "pilates";
export const SERVICE_KEYS: ServiceKey[] = ["gym", "pilates"];

// `phrase` is the noun form used when the generator drops it into a sentence
// (e.g. "運動不足が気になっていて…"). `label` is what the chip shows.
export type ReasonOption = { label: string; phrase: string };

// `phrase` is a complete polite sentence (ending in 。) the generator can
// drop in as-is. "__AREA__" is replaced with the area name.
export type HighlightOption = { label: string; phrase: string };

// One complete sentence per tone, in the same order as the tones in
// review-generator.ts: [丁寧, 温かみ, シンプル].
export type ImpressionOption = { label: string; variants: [string, string, string] };

// "どんな方におすすめか". Named audiences ("運動初心者の方" etc.) give the
// finished review the search keywords people actually look for on Google Maps.
export type ServiceConfig = {
  key: ServiceKey;
  label: string; // shown on the first-question chip
  noun: string; // used in sentences, e.g. "パーソナルジムをお探しの…"
  siteName: string; // descriptor + store name, e.g. "パーソナルジムEARTH"
  experience: string; // used right after siteName, e.g. "体験トレーニング"
  experienceFull: string; // used after the store name alone, e.g. "ピラティスの体験レッスン"
  reasons: ReasonOption[];
  highlights: HighlightOption[];
  impressions: ImpressionOption[];
  audiences: string[];
};

const GYM: ServiceConfig = {
  key: "gym",
  label: "パーソナルジム",
  noun: "パーソナルジム",
  siteName: "パーソナルジムEARTH",
  experience: "体験トレーニング",
  experienceFull: "体験トレーニング",
  audiences: [
    "運動初心者の方",
    "ダイエットを頑張りたい方",
    "姿勢や肩こり・腰痛が気になる方",
    "忙しくて時間が取れない方",
    "産後の体型が気になる方",
    "運動不足を解消したい方",
  ],
  reasons: [
    { label: "運動不足を感じていた", phrase: "運動不足" },
    { label: "ダイエット・体型の変化が気になった", phrase: "体型の変化" },
    { label: "姿勢や腰・肩の不調が気になった", phrase: "姿勢や腰・肩の不調" },
    { label: "産後の体型をケアしたかった", phrase: "産後の体型の変化" },
    { label: "健康診断がきっかけだった", phrase: "健康診断の結果" },
    { label: "筋力・体力の維持がしたかった", phrase: "体力・筋力の衰え" },
  ],
  highlights: [
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
    {
      label: "食事のアドバイスももらえた",
      phrase: "トレーニングだけでなく、食事のアドバイスももらえて心強かったです。",
    },
    {
      label: "30分・60分から選べて通いやすい",
      phrase: "30分・60分から時間を選べるので、忙しい方でも無理なく通えそうだと思いました。",
    },
    {
      label: "営業時間が長く通いやすい",
      phrase: "朝7時から夜22時まで営業していて、仕事の前後にも立ち寄りやすいです。",
    },
  ],
  impressions: [
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
  ],
};

const PILATES: ServiceConfig = {
  key: "pilates",
  label: "ピラティス",
  noun: "ピラティス",
  siteName: "ピラティススタジオEARTH",
  experience: "体験レッスン",
  experienceFull: "ピラティスの体験レッスン",
  audiences: [
    "ピラティス初心者の方",
    "姿勢や猫背が気になる方",
    "肩こり・腰痛でお悩みの方",
    "体の硬さが気になる方",
    "産後のボディケアをしたい方",
    "運動不足を解消したい方",
  ],
  reasons: [
    { label: "姿勢や猫背が気になっていた", phrase: "姿勢や猫背" },
    { label: "肩こり・腰痛が気になっていた", phrase: "肩こりや腰痛" },
    { label: "体の硬さを改善したかった", phrase: "体の硬さ" },
    { label: "産後の体型や体幹が気になった", phrase: "産後の体型や体幹" },
    { label: "運動不足を感じていた", phrase: "運動不足" },
    { label: "体のラインを整えたかった", phrase: "体のライン" },
  ],
  highlights: [
    {
      label: "インストラクターの説明がわかりやすかった",
      phrase: "インストラクターさんの説明がとても丁寧でわかりやすかったです。",
    },
    {
      label: "体の状態を丁寧に見てくれた",
      phrase: "インストラクターさんが体の状態を丁寧に見てくれて、安心して受けられました。",
    },
    {
      label: "初めてでも無理なく動けた",
      phrase: "ピラティスが初めての私でも、無理なく体を動かすことができました。",
    },
    {
      label: "雰囲気が良くリラックスできた",
      phrase: "スタジオの雰囲気が落ち着いていて、リラックスして受けられました。",
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
      label: "自分の悩みに合わせてくれた",
      phrase: "自分の体の悩みに合わせて、動きを選んでくれました。",
    },
  ],
  impressions: [
    {
      label: "体が伸びてすっきりした",
      variants: [
        "体験後は、体がのびのびとして、すっきりした感覚がありました。",
        "終わったあとは体がぐーんと伸びて、すっきりした気分になりました。",
        "体が伸びてすっきりしました。",
      ],
    },
    {
      label: "姿勢を意識するようになった",
      variants: [
        "普段の姿勢を意識するきっかけになりました。",
        "自分の姿勢のクセに気づけて、意識するようになりました。",
        "姿勢を意識するようになりました。",
      ],
    },
    {
      label: "呼吸や体の使い方に気づけた",
      variants: [
        "呼吸や体の使い方について、新しい気づきがありました。",
        "呼吸と一緒に体を動かす心地よさに気づくことができました。",
        "体の使い方に気づけました。",
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
  ],
};

export const SERVICES: Record<ServiceKey, ServiceConfig> = {
  gym: GYM,
  pilates: PILATES,
};
