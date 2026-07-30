import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { LogoutButton } from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!authed) {
    return (
      <main className="mx-auto max-w-2xl px-6">
        <AdminLoginForm />
      </main>
    );
  }

  let submissions: Awaited<ReturnType<typeof prisma.reviewSubmission.findMany>> = [];
  let dbError = false;
  try {
    submissions = await prisma.reviewSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch (error) {
    console.error("[admin] failed to load submissions", error);
    dbError = true;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">クチコミ下書き 送信一覧</h1>
        <LogoutButton />
      </div>

      {dbError && (
        <p className="mb-6 rounded-xl bg-accent/10 p-4 text-sm text-ink">
          データベースに接続できませんでした。本番環境の場合は、TURSO_DATABASE_URL /
          TURSO_AUTH_TOKEN が正しく設定されているかご確認ください(README参照)。
        </p>
      )}

      {!dbError && submissions.length === 0 && (
        <p className="text-sm text-ink-soft">まだ送信はありません。</p>
      )}

      <div className="flex flex-col gap-6">
        {submissions.map((submission) => {
          const drafts = JSON.parse(submission.drafts) as string[];
          const highlights = JSON.parse(submission.highlights) as string[];
          const reasons = JSON.parse(submission.reasons) as string[];
          return (
            <article
              key={submission.id}
              className="rounded-2xl bg-paper-alt p-6 shadow-[0_1px_2px_rgba(34,30,24,0.06),0_12px_28px_-18px_rgba(34,30,24,0.2)]"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                <span>{submission.createdAt.toLocaleString("ja-JP")}</span>
                <span>・{submission.course}</span>
                <span>・満足度 {"★".repeat(submission.rating)}</span>
                {submission.postedToGoogle && (
                  <span className="rounded-full bg-moss/10 px-2 py-0.5 text-moss">投稿済み</span>
                )}
              </div>

              {reasons.length > 0 && (
                <p className="mb-1 text-xs text-ink-soft">きっかけ: {reasons.join(" / ")}</p>
              )}
              <p className="mb-1 text-xs text-ink-soft">良かった点: {highlights.join(" / ")}</p>
              {submission.trainerName && (
                <p className="mb-1 text-xs text-ink-soft">担当: {submission.trainerName}</p>
              )}
              {submission.impression && (
                <p className="mb-1 text-xs text-ink-soft">印象: {submission.impression}</p>
              )}
              {submission.note && (
                <p className="mb-3 text-xs text-ink-soft">一言: {submission.note}</p>
              )}

              {submission.chosenDraft ? (
                <div className="rounded-xl bg-accent/10 p-4 text-sm leading-relaxed text-ink">
                  <p className="mb-1 text-xs tracking-[0.15em] text-accent">選ばれた文章</p>
                  {submission.chosenDraft}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {drafts.map((draft, index) => (
                    <p
                      key={index}
                      className="rounded-xl bg-paper p-3 text-xs leading-relaxed text-ink-soft"
                    >
                      {draft}
                    </p>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
