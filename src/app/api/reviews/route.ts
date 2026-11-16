import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  generateDrafts,
  resolveHighlightPhrases,
  resolveImpressionVariants,
  resolveReasonPhrases,
} from "@/lib/review-generator";
import { SERVICES, SERVICE_KEYS } from "@/lib/survey-options";

const submitSchema = z
  .object({
    service: z.enum(SERVICE_KEYS as [string, ...string[]]),
    reasons: z.array(z.string()).max(20),
    highlights: z.array(z.string()).max(20),
    impressions: z.array(z.string()).max(20),
    audiences: z.array(z.string()).max(20),
    rating: z.number().int().min(3).max(5),
  })
  .superRefine((value, ctx) => {
    const service = SERVICES[value.service as keyof typeof SERVICES];
    const checks: [string, string[], string[]][] = [
      ["reasons", value.reasons, service.reasons.map((o) => o.label)],
      ["highlights", value.highlights, service.highlights.map((o) => o.label)],
      ["impressions", value.impressions, service.impressions.map((o) => o.label)],
      ["audiences", value.audiences, service.audiences],
    ];
    for (const [field, selected, allowed] of checks) {
      if (selected.some((label) => !allowed.includes(label))) {
        ctx.addIssue({ code: "custom", path: [field], message: "選択内容が正しくありません。" });
      }
    }
    if (value.highlights.length === 0) {
      ctx.addIssue({ code: "custom", path: ["highlights"], message: "良かった点を1つ以上選んでください" });
    }
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
  const service = answers.service as keyof typeof SERVICES;
  const drafts = generateDrafts(service, {
    reasons: resolveReasonPhrases(service, answers.reasons),
    highlights: resolveHighlightPhrases(service, answers.highlights),
    impressions: resolveImpressionVariants(service, answers.impressions),
    audiences: answers.audiences,
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
        service,
        audiences: JSON.stringify(answers.audiences),
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
