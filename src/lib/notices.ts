import { Notice } from "@/lib/types";

export const ALL_SOURCES = "__ALL_SOURCES__";
export const ALL_DEPARTMENTS = "__ALL_DEPARTMENTS__";
export const ALL_CATEGORIES = "__ALL_CATEGORIES__";

const EMPTY_TOKENS = new Set([
  "",
  "-",
  "_",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "미분류",
  "기타"
]);

const ALL_FILTER_TOKENS = new Set([
  ALL_SOURCES.toLowerCase(),
  ALL_DEPARTMENTS.toLowerCase(),
  ALL_CATEGORIES.toLowerCase(),
  "all",
  "전체",
  "전체출처",
  "전체 출처",
  "전체부서",
  "전체 부서",
  "전체분류",
  "전체 분류"
]);

const SEARCH_STOP_WORDS = new Set([
  "공지",
  "공지사항",
  "정보",
  "내용",
  "관련",
  "문의",
  "질문",
  "알려줘",
  "알려주세요",
  "보여줘",
  "보여주세요",
  "뭐야",
  "무엇",
  "뭔지",
  "정리",
  "요약",
  "최신",
  "최근",
  "확인",
  "안내",
  "좀",
  "해줘",
  "해주세요",
  "please",
  "show",
  "find",
  "about",
  "latest",
  "info"
]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

function compact(value: string): string {
  return value.replace(/\s+/g, "");
}

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }

    seen.add(value);
    result.push(value);
  }

  return result;
}

export function extractSearchTerms(input?: string): string[] {
  const normalizedInput = normalizeWhitespace(input ?? "");
  if (!normalizedInput) {
    return [];
  }

  const rawTokens = normalizedInput
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  if (rawTokens.length === 0) {
    return [];
  }

  const significant = rawTokens.filter((token) => {
    if (SEARCH_STOP_WORDS.has(token)) {
      return false;
    }

    // 숫자가 아닌 한 글자 토큰은 검색 노이즈가 되기 쉬워 제외한다.
    if (token.length === 1 && !/^\d+$/.test(token)) {
      return false;
    }

    return true;
  });

  const selected = significant.length > 0 ? significant : rawTokens;
  return uniquePreserveOrder(selected);
}

export function normalizeFacetValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return undefined;
  }

  if (EMPTY_TOKENS.has(normalized.toLowerCase())) {
    return undefined;
  }

  return normalized;
}

export function normalizeFilterValue(value: unknown): string | undefined {
  const normalized = normalizeFacetValue(value);
  if (!normalized) {
    return undefined;
  }

  if (ALL_FILTER_TOKENS.has(normalizeToken(normalized))) {
    return undefined;
  }

  return normalized;
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, "ko"));
}

export function getAllSources(notices: Notice[]): string[] {
  return uniqueSorted(notices.map((notice) => normalizeFacetValue(notice.source)));
}

export function getAllDepartments(notices: Notice[]): string[] {
  return uniqueSorted(notices.map((notice) => normalizeFacetValue(notice.department)));
}

function isCategoryShapeUseful(value: string): boolean {
  if (value.length < 2 || value.length > 24) {
    return false;
  }

  if (/[<>]/.test(value)) {
    return false;
  }

  return true;
}

export function getCleanCategories(notices: Notice[]): string[] {
  const categories = notices
    .map((notice) => normalizeFacetValue(notice.category))
    .filter((value): value is string => Boolean(value));

  if (categories.length === 0) {
    return [];
  }

  const countMap = new Map<string, number>();
  for (const category of categories) {
    countMap.set(category, (countMap.get(category) ?? 0) + 1);
  }

  const entries = [...countMap.entries()];
  const oneOffCount = entries.filter(([, count]) => count === 1).length;
  const oneOffRatio = oneOffCount / entries.length;

  const cleaned = entries
    .filter(([category, count]) => count >= 2 && isCategoryShapeUseful(category))
    .map(([category]) => category)
    .sort((a, b) => a.localeCompare(b, "ko"));

  if (cleaned.length === 0) {
    return [];
  }

  // 노이즈가 많으면 category 자체를 숨겨 source+검색 탐색에 집중한다.
  if (entries.length > 18 || oneOffRatio > 0.35) {
    return [];
  }

  return cleaned.slice(0, 12);
}

function buildSearchText(notice: Notice): string {
  return [
    notice.title,
    notice.summary,
    notice.content,
    normalizeFacetValue(notice.source),
    normalizeFacetValue(notice.department),
    normalizeFacetValue(notice.category),
    ...notice.tags
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .toLowerCase();
}

export interface NoticeFilterInput {
  q?: string;
  source?: string;
  department?: string;
  category?: string;
}

export function filterNotices(notices: Notice[], input: NoticeFilterInput): Notice[] {
  const sourceFilter = normalizeFilterValue(input.source);
  const departmentFilter = normalizeFilterValue(input.department);
  const categoryFilter = normalizeFilterValue(input.category);
  const terms = extractSearchTerms(input.q);
  const normalizedQuery = normalizeWhitespace(input.q ?? "").toLowerCase();
  const compactQuery = compact(normalizedQuery);

  return notices.filter((notice) => {
    const source = normalizeFacetValue(notice.source);
    const department = normalizeFacetValue(notice.department);
    const category = normalizeFacetValue(notice.category);

    if (sourceFilter && source !== sourceFilter) {
      return false;
    }

    if (departmentFilter && department !== departmentFilter) {
      return false;
    }

    if (categoryFilter && category !== categoryFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = buildSearchText(notice);
    if (searchable.includes(normalizedQuery)) {
      return true;
    }

    const compactSearchable = compact(searchable);
    if (compactQuery && compactSearchable.includes(compactQuery)) {
      return true;
    }

    if (terms.length === 0) {
      return false;
    }

    const matchedCount = terms.filter((term) => {
      if (searchable.includes(term)) {
        return true;
      }

      const compactTerm = compact(term);
      return compactTerm.length > 0 && compactSearchable.includes(compactTerm);
    }).length;

    const requiredMatches = Math.min(2, terms.length);
    return matchedCount >= requiredMatches;
  });
}

export function formatSourceLabel(source: string): string {
  const normalized = normalizeWhitespace(source);
  const compact = normalized.replace(/^한국항공대학교\s*/, "");
  return compact || normalized;
}
