import Link from "next/link";
import { ArrowRight, ShoppingCart, Store } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { btnOutlineInk, btnPrimary } from "@/lib/ui";

const STEPS = [
  { title: "เลือกเมนู", text: "เลือกอาหารและเครื่องดื่มที่อยากกิน ใส่ลงตะกร้า" },
  { title: "ยืนยันออเดอร์", text: "ตรวจรายการ ใส่ชื่อ แล้วกด “ยืนยันสั่งอาหาร”" },
  { title: "ติดตามสถานะ", text: "ดูได้ว่าร้านกำลังทำถึงขั้นไหน อัปเดตให้อัตโนมัติ" },
];

export default function Home() {
  return (
    <>
      <SiteHeader variant="customer" />
      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-[32px] leading-tight font-extrabold text-balance sm:text-[44px]">
            หิวแล้วใช่ไหม? สั่งอาหารได้ใน 3 ขั้นตอน
          </h1>
          <p className="mx-auto mt-3 max-w-[640px] text-[18px] text-muted sm:text-[20px]">
            เลือกเมนูที่ชอบ ใส่ชื่อ แล้วกดสั่ง — ติดตามสถานะได้ทันทีโดยไม่ต้องสมัครสมาชิก
          </p>
        </section>

        {/* การ์ดเลือกฝั่งผู้ใช้ */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          <section className="flex flex-col items-start rounded-panel border-2 border-brand bg-white p-6 shadow-panel sm:p-8">
            <span className="grid size-[72px] place-items-center rounded-card bg-brand-tint">
              <ShoppingCart className="size-9 text-brand-dark" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-[26px] font-bold sm:text-[30px]">ลูกค้า: สั่งอาหาร</h2>
            <p className="mt-2 mb-6 text-[18px] text-muted">
              ดูเมนู เลือกอาหาร ใส่ตะกร้า แล้วยืนยันออเดอร์ได้เลย
            </p>
            <Link href="/menu" className={`${btnPrimary} mt-auto h-14 w-full text-[20px] sm:w-auto`}>
              เริ่มสั่งอาหาร
              <ArrowRight className="size-6" aria-hidden="true" />
            </Link>
          </section>

          <section className="flex flex-col items-start rounded-panel border-2 border-edge bg-white p-6 shadow-panel sm:p-8">
            <span className="grid size-[72px] place-items-center rounded-card bg-sand">
              <Store className="size-9 text-ink" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-[26px] font-bold sm:text-[30px]">ร้านค้า: จัดการออเดอร์</h2>
            <p className="mt-2 mb-6 text-[18px] text-muted">
              ดูออเดอร์ที่เข้ามาและเปลี่ยนสถานะทีละขั้นได้ในแวบเดียว
            </p>
            <Link href="/vendor" className={`${btnOutlineInk} mt-auto h-14 w-full text-[20px] sm:w-auto`}>
              เข้าสู่หน้าร้านค้า
              <ArrowRight className="size-6" aria-hidden="true" />
            </Link>
          </section>
        </div>

        {/* 3 ขั้นตอน */}
        <section aria-labelledby="steps-title" className="rounded-panel border border-line bg-white p-6 sm:p-8">
          <h2 id="steps-title" className="text-center text-[24px] font-extrabold">
            ใช้งานง่ายแค่ 3 ขั้นตอน
          </h2>
          <ol className="mt-6 flex flex-col gap-6 md:flex-row md:gap-10">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-1 items-start gap-4 md:flex-col md:items-center md:text-center"
              >
                <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-brand text-[24px] font-extrabold text-ink">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[22px] font-bold">{step.title}</p>
                  <p className="mt-1 text-[17px] text-muted">{step.text}</p>
                </div>
                {/* ลูกศรเทาคั่นระหว่างขั้น (เฉพาะจอกว้าง) */}
                {index < STEPS.length - 1 && (
                  <ArrowRight
                    className="absolute top-3 -right-[34px] hidden size-7 text-input-border md:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-[15px] text-muted">
        Food Ordering · โปรเจกต์ระบบสั่งอาหารออนไลน์
      </footer>
    </>
  );
}
