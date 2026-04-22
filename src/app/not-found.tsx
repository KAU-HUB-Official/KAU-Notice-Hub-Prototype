import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">요청한 공지를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-3 inline-block text-sm text-brand-700 hover:underline">
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
