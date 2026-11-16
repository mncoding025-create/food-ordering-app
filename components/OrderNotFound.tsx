"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { btnOutlineInk, btnPrimary } from "@/lib/ui";

// แสดงเมื่อค้นเลขออเดอร์แล้วไม่พบ
export default function OrderNotFound({
  orderNumber,
  onRetry,
}: {
  orderNumber: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-panel border-2 border-danger-soft bg-white px-6 py-10 text-center"
    >
      <span className="grid size-20 place-items-center rounded-full bg-danger-tint">
        <SearchX className="size-11 text-danger" aria-hidden="true" />
      </span>
      <h2 className="text-[26px] leading-tight font-extrabold break-all sm:text-[32px]">
        ไม่พบเลขออเดอร์ {orderNumber}
      </h2>
      <p className="max-w-[520px] text-[18px] text-muted">
        ลองตรวจสอบว่าพิมพ์เลขถูกต้อง เลขออเดอร์จะเป็นรูปแบบ FO-0001 (FO ตามด้วยเลข 4 หลัก)
      </p>
      <div className="mt-3 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <button type="button" onClick={onRetry} className={`${btnPrimary} h-14`}>
          ลองค้นหาใหม่
        </button>
        <Link href="/menu" className={`${btnOutlineInk} h-14`}>
          กลับไปสั่งอาหาร
        </Link>
      </div>
    </div>
  );
}
