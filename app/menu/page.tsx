import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import MenuClient from "./MenuClient";

export const metadata: Metadata = {
  title: "เมนูวันนี้ — Food Ordering",
};

export default function MenuPage() {
  return (
    <>
      <SiteHeader variant="customer" />
      {/* pb-32 บนมือถือ เว้นที่ให้แถบตะกร้าด้านล่าง */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pt-8 lg:pb-12">
        <MenuClient
          intro={
            <div>
              <h1 className="text-[30px] leading-tight font-extrabold sm:text-[36px]">เมนูวันนี้</h1>
              <p className="mt-1 text-[18px] text-muted">เลือกเมนูที่ชอบ แล้วกด “เพิ่มลงตะกร้า”</p>
            </div>
          }
        />
      </main>
    </>
  );
}
