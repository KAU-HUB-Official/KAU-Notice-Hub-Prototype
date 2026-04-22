import Link from "next/link";
import { notFound } from "next/navigation";

import { noticeService } from "@/server/notices";

export const dynamic = "force-dynamic";

interface NoticeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const noticeId = decodeURIComponent(params.id);
  const notice = await noticeService.getNoticeById(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <Link href="/" className="text-sm text-brand-700 hover:underline">
          ← 목록으로 돌아가기
        </Link>

        <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{notice.title}</h1>

        <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-sm text-slate-600">
          {notice.date ? <span className="break-words">{notice.date}</span> : null}
          {notice.source ? <span className="break-all">• {notice.source}</span> : null}
          {notice.category ? <span className="break-all">• {notice.category}</span> : null}
          {notice.department ? <span className="break-all">• {notice.department}</span> : null}
        </div>

        {notice.url ? (
          <p className="mt-3 min-w-0 text-sm">
            원문 링크: <Link href={notice.url} target="_blank" rel="noreferrer" className="break-all hover:underline">{notice.url}</Link>
          </p>
        ) : null}

        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">요약</h2>
          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-7 text-slate-800">{notice.summary ?? "요약 정보 없음"}</p>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">본문</h2>
          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-7 text-slate-800">{notice.content}</p>
        </section>

        {notice.attachments.length > 0 ? (
          <section className="mt-4 rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">첨부파일</h2>
            <ul className="mt-2 min-w-0 space-y-1 text-sm text-slate-700">
              {notice.attachments.map((attachment, index) => (
                <li key={`${attachment.url}-${index}`}>
                  <Link href={attachment.url} target="_blank" rel="noreferrer" className="break-all hover:underline">
                    {attachment.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
