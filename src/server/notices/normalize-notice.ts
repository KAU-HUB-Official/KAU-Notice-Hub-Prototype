import { Notice, NoticeAttachment, RawNotice } from "@/lib/types";

const DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/;

function toStringValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function firstString(raw: RawNotice, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = toStringValue(raw[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function normalizeDate(rawValue: unknown): string | undefined {
  const value = toStringValue(rawValue);
  if (!value) {
    return undefined;
  }

  const matched = value.match(DATE_PATTERN);
  if (matched?.[1]) {
    return matched[1];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
}

function stripHtml(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeSummary(content: string, fallback?: string): string {
  if (fallback?.trim()) {
    return fallback.trim();
  }

  const plain = stripHtml(content);
  return plain.length <= 180 ? plain : `${plain.slice(0, 180)}...`;
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "notice";
}

function normalizeAttachments(rawValue: unknown): NoticeAttachment[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  const attachments: NoticeAttachment[] = [];

  for (const item of rawValue) {
    if (typeof item === "string") {
      const url = item.trim();
      if (url) {
        attachments.push({ name: "첨부파일", url });
      }
      continue;
    }

    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const url = toStringValue(record.url) ?? toStringValue(record.href) ?? toStringValue(record.link);
      if (!url) {
        continue;
      }

      const name =
        toStringValue(record.name) ?? toStringValue(record.filename) ?? toStringValue(record.title) ?? "첨부파일";
      attachments.push({ name, url });
    }
  }

  return attachments;
}

function normalizeTags(raw: RawNotice, source?: string, category?: string): string[] {
  const fromRaw = raw.tags;
  const tags = new Set<string>();

  if (Array.isArray(fromRaw)) {
    for (const value of fromRaw) {
      if (typeof value === "string" && value.trim()) {
        tags.add(value.trim());
      }
    }
  }

  if (category) {
    tags.add(category);
  }

  if (source) {
    tags.add(source);
  }

  return [...tags];
}

export function normalizeNotice(raw: RawNotice, index: number): Notice {
  const title =
    firstString(raw, ["title", "subject", "name"]) ??
    `제목 없음 공지 ${index + 1}`;

  const content =
    firstString(raw, ["content", "body", "text", "description"]) ??
    "본문 정보가 비어 있습니다.";

  const source = firstString(raw, ["source", "source_name", "source_type", "board"]);
  const category = firstString(raw, ["category", "category_raw", "type"]);
  const department = firstString(raw, ["department", "department_name", "office"]);
  const url = firstString(raw, ["url", "original_url", "link", "href"]);
  const date = normalizeDate(raw.date ?? raw.published_at ?? raw.created_at ?? raw.updated_at);

  const fallbackIdSeed = `${title}-${date ?? ""}-${source ?? ""}-${index + 1}`;
  const id =
    firstString(raw, ["id", "notice_id", "post_id", "uuid"]) ??
    slugify(fallbackIdSeed);

  const summary = makeSummary(content, firstString(raw, ["summary", "excerpt", "short_description"]));

  return {
    id,
    title,
    content,
    url,
    source,
    category,
    department,
    date,
    summary,
    tags: normalizeTags(raw, source, category),
    attachments: normalizeAttachments(raw.attachments)
  };
}
