import Link from "next/link";

import { Notice } from "@/lib/types";

function formatDate(value?: string): string {
  if (!value) {
    return "날짜 미상";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(parsed);
}

interface NoticeCardProps {
  notice: Notice;
  showCategory: boolean;
}

export default function NoticeCard({ notice, showCategory }: NoticeCardProps) {
  const summary = notice.summary ?? notice.content.slice(0, 200);

  return (
    <article className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm">
      <Link href={`/notices/${encodeURIComponent(notice.id)}`} className="block min-w-0">
        <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-slate-900 md:text-lg">
          {notice.title}
        </h3>

        <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-xs text-slate-600">
          <span className="max-w-full rounded-full bg-slate-100 px-2 py-1 break-words">{formatDate(notice.date)}</span>
          <span className="max-w-full rounded-full bg-brand-50 px-2 py-1 text-brand-700 break-all">{notice.source ?? "출처 미상"}</span>
          <span className="max-w-full rounded-full bg-slate-100 px-2 py-1 break-all">{notice.department ?? "부서 미기재"}</span>
          {showCategory && notice.category ? (
            <span className="max-w-full rounded-full bg-amber-50 px-2 py-1 text-amber-700 break-all">{notice.category}</span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-3 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">{summary}</p>
      </Link>
    </article>
  );
}
