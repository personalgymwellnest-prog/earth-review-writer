import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateDrafts, resolveHighlightPhrases, resolveReasonPhrases } from "@/lib/review-generator";
import { COURSE_OPTIONS, HIGHLIGHT_OPTIONS, REASON_OPTIONS } from "@/lib/survey-options";

const reasonLabels = REASON_OPTIONS.map((option) => option.label);
const highlightLabels = HIGHLIGHT_OPTIONS.map((option) => option.label);

const submitSchema = z.object({
  course: z.enum(COURSE_OPTIONS),
  reasons: z.array(z.enum(reasonLabels as [string, ...string[]])).max(reasonLabels.length),
  highlights: z
    .array(z.enum(highlightLabels as [string, ...string[]]))
    .min(1, "良かった点を1つ以上選んでください")
    .max(highlightLabels.length),
  trainerName: z.string().trim().max(30).optional(),
  impression: z.string().trim().max(200).optional(),
  rating: z.number().int().min(1).max(5),
  note: z.string().trim().max(300).optional(),
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
    course: answers.course,
    reasons: resolveReasonPhrases(answers.reasons),
    highlights: resolveHighlightPhrases(answers.highlights),
    trainerName: answers.trainerName,
    impression: answers.impression,
    rating: answers.rating,
    note: answers.note,
  });

  // The draft text is generated locally and doesn't depend on the database,
  // so a customer can always get their drafts even if persistence (used for
  // the /admin log) is unavailable -- e.g. no database configured yet on a
  // freshly deployed serverless host.
  let submissionId: string | null = null;
  try {
    const submission = await prisma.reviewSubmission.create({
      data: {
        course: answers.course,
        reasons: JSON.stringify(answers.reasons),
        highlights: JSON.stringify(answers.highlights),
        trainerName: answers.trainerName || null,
        impression: answers.impression || null,
        rating: answers.rating,
        note: answers.note || null,
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
