import { JsonNoticeRepository } from "./json-notice-repository";
import { NoticeService } from "./notice-service";

const repository = new JsonNoticeRepository();

export const noticeService = new NoticeService(repository);
