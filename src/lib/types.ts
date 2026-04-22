export type RawNotice = Record<string, unknown>;

export interface NoticeAttachment {
  name: string;
  url: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  url?: string;
  source?: string;
  category?: string;
  department?: string;
  date?: string;
  summary?: string;
  tags: string[];
  attachments: NoticeAttachment[];
}

export interface NoticeQuery {
  q?: string;
  source?: string;
  category?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface NoticeFacets {
  sources: string[];
  categories: string[];
  departments: string[];
}

export interface NoticeListResult {
  items: Notice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: NoticeFacets;
}

export interface NoticeReference {
  id: string;
  title: string;
  url?: string;
  source?: string;
  date?: string;
}

export interface ChatAnswer {
  answer: string;
  references: NoticeReference[];
  usedFallback: boolean;
  model: string;
}

export interface ChatRequestBody {
  question: string;
  source?: string;
  category?: string;
  department?: string;
}
