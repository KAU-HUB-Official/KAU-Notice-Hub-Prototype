import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAU Notice Hub MVP",
  description: "JSON 기반 대학 공지 탐색 + AI 챗봇 MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
