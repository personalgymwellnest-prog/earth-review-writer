import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  generateDrafts,
  resolveHighlightPhrases,
  resolveImpressionVariants,
  resolveReasonPhrases,
} from "@/lib/review-generator";
import { HIGHLIGHT_OPTIONS, IMPRESSION_OPTIONS, REASON_OPTIONS } from "@/lib/survey-options";

const reasonLabels = REASON_OPTIONS.map((option) => option.label);
const highlightLabels = HIGHLIGHT_OPTIONS.map((option) => option.label);
const impressionLabels = IMPRESSION_OPTIONS.map((option) => option.label);

const submitSchema = z.object({
  reasons: z.array(z.enum(reasonLabels as [string, ...string[]])).max(reasonLabels.length),
  highlights: z
    .array(z.enum(highlightLabels as [string, ...string[]]))
    .min(1, "良かった点を1つ以上選んでください")
    .max(highlightLabels.length),
  impressions: z.array(z.enum(impressionLabels as [string, ...string[]])).max(impressionLabels.length),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
      { status: 400 }
    );
  }

  const answers = parsed.data;
  const drafts = generateDrafts({
    reasons: resolveReasonPhrases(answers.reasons),
    highlights: resolveHighlightPhrases(answers.highlights),
    impressions: resolveImpressionVariants(answers.impressions),
    rating: answers.rating,
  });

  // The draft text is generated locally and doesn't depend on the database,
  // so a customer can always get their drafts even if persistence (used for
  // the /admin log) is unavailable -- e.g. no database configured yet on a
  // freshly deployed serverless host.
  let submissionId: string | null = null;
  try {
    const submission = await prisma.reviewSubmission.create({
      data: {
        reasons: JSON.stringify(answers.reasons),
        highlights: JSON.stringify(answers.highlights),
        impression: answers.impressions.length > 0 ? JSON.stringify(answers.impressions) : null,
        rating: answers.rating,
        drafts: JSON.stringify(drafts),
      },
    });
    submissionId = submission.id;
  } catch (error) {
    console.error("[reviews] failed to persist submission", error);
  }

  return NextResponse.json({ ok: true, id: submissionId, drafts });
}

const chooseSchema = z.object({
  id: z.string().min(1),
  chosenDraft: z.string().min(1).max(1000),
  postedToGoogle: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chooseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  try {
    await prisma.reviewSubmission.update({
      where: { id: parsed.data.id },
      data: {
        chosenDraft: parsed.data.chosenDraft,
        ...(parsed.data.postedToGoogle !== undefined
          ? { postedToGoogle: parsed.data.postedToGoogle }
          : {}),
      },
    });
  } catch (error) {
    console.error("[reviews] failed to update submission", error);
  }

  return NextResponse.json({ ok: true });
}
