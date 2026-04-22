import { Notice } from "@/lib/types";
import { normalizeFacetValue } from "@/lib/notices";

import NoticeCard from "./NoticeCard";

interface NoticeListProps {
  notices: Notice[];
  cleanCategories: string[];
}

export default function NoticeList({ notices, cleanCategories }: NoticeListProps) {
  const cleanedCategorySet = new Set(cleanCategories);
  const showCategory = cleanedCategorySet.size > 0;

  if (notices.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        조건에 맞는 공지가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {notices.map((notice) => {
        const normalizedCategory = normalizeFacetValue(notice.category);
        const category =
          showCategory && normalizedCategory && cleanedCategorySet.has(normalizedCategory)
            ? normalizedCategory
            : undefined;

        return (
          <NoticeCard
            key={notice.id}
            notice={{
              ...notice,
              category
            }}
            showCategory={showCategory}
          />
        );
      })}
    </div>
  );
}
