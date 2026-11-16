import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

// ฟอนต์ไทยหลักของทั้งเว็บ (variable font ครอบคลุมน้ำหนัก 400–800)
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Food Ordering — สั่งอาหารออนไลน์",
  description: "สั่งอาหารออนไลน์ ติดตามสถานะได้ทันที และหน้าร้านค้าสำหรับจัดการออเดอร์",
};

// header ของแต่ละฝั่ง (ลูกค้า / ติดตาม / ร้านค้า) ต่างกันตามดีไซน์
// จึงให้แต่ละหน้าใส่ <SiteHeader variant=...> เอง
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
