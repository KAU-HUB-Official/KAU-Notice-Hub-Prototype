import { Notice } from "@/lib/types";

export interface NoticeRepository {
  listAll(): Promise<Notice[]>;
  getById(id: string): Promise<Notice | null>;
}
