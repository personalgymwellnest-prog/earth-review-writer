export const SITE_NAME = "パーソナルジムEARTH";

// Set once the tool is deployed, so shared LINE/OGP links resolve to
// absolute URLs. Falls back to localhost for local development.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3003";

export const STORE = {
  name: "EARTH",
  areaName: "堺市北区",
  fullAddress: "大阪府堺市北区北長尾町1-5-13 Bel Rosso 2F",
  mapLinkHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("大阪府堺市北区北長尾町1-5-13 Bel Rosso 2F"),
} as const;

// Google Business Profile "get more reviews" short links (Business Profile >
// 口コミ > 口コミの入力を依頼), which drop the customer straight into the
// star-rating + review-text screen. Each service has its own Google listing.
// The env vars can override these defaults without a code change.
export const GOOGLE_REVIEW_URLS = {
  gym:
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || "https://g.page/r/CTEf2Kdk-1l4EAI/review",
  pilates:
    process.env.NEXT_PUBLIC_PILATES_REVIEW_URL?.trim() || "https://g.page/r/CYhdxTQ8dDPrEAE/review",
} as const;
