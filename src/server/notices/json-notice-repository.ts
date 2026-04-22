import { stat, readFile } from "node:fs/promises";
import path from "node:path";

import { Notice, RawNotice } from "@/lib/types";

import { normalizeNotice } from "./normalize-notice";
import { NoticeRepository } from "./notice-repository";

interface CacheEntry {
  filePath: string;
  mtimeMs: number;
  notices: Notice[];
}

let cache: CacheEntry | null = null;

export class JsonNoticeRepository implements NoticeRepository {
  private readonly filePath: string;

  constructor(filePath = process.env.NOTICE_JSON_PATH ?? "kau_official_posts.json") {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  async listAll(): Promise<Notice[]> {
    const nextCache = await this.readAndNormalize();
    return nextCache.notices;
  }

  async getById(id: string): Promise<Notice | null> {
    const notices = await this.listAll();
    return notices.find((notice) => notice.id === id) ?? null;
  }

  private async readAndNormalize(): Promise<CacheEntry> {
    const fileStat = await stat(this.filePath);

    if (
      cache &&
      cache.filePath === this.filePath &&
      cache.mtimeMs === fileStat.mtimeMs
    ) {
      return cache;
    }

    const content = await readFile(this.filePath, "utf-8");
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error("공지 JSON 파일은 배열(Array) 형식이어야 합니다.");
    }

    const usedIds = new Map<string, number>();
    const notices = parsed
      .filter((item): item is RawNotice => Boolean(item) && typeof item === "object")
      .map((item, index) => normalizeNotice(item, index))
      .map((notice) => {
        const current = usedIds.get(notice.id) ?? 0;
        usedIds.set(notice.id, current + 1);

        if (current === 0) {
          return notice;
        }

        return {
          ...notice,
          id: `${notice.id}-${current + 1}`
        };
      });

    cache = {
      filePath: this.filePath,
      mtimeMs: fileStat.mtimeMs,
      notices
    };

    return cache;
  }
}
