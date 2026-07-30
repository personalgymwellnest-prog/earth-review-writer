export const SITE_NAME = "パーソナルジムEARTH";

// Set once the tool is deployed, so shared LINE/OGP links resolve to
// absolute URLs. Falls back to localhost for local development.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3003";

export const STORE = {
  name: "EARTH 堺市北区店",
  areaName: "堺市北区",
  fullAddress: "大阪府堺市北区北長尾町1-5-13 Bel Rosso 2F",
  mapLinkHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("大阪府堺市北区北長尾町1-5-13 Bel Rosso 2F"),
} as const;

// Prefer a Google Business Profile "get more reviews" short link
// (Google Business Profile > クチコミ > クチコミの入力を依頼), which drops the
// customer straight into the star-rating + review-text screen. Until that's
// configured, fall back to a maps search link the customer can find
// "クチコミを書く" from.
export const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || STORE.mapLinkHref;
