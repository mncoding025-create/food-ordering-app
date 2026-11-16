"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatBaht, formatTime } from "@/lib/format";
import { nextStatus, STATUS_META } from "@/lib/order-status";
import { btnPrimary } from "@/lib/ui";
import type { Order } from "@/lib/types";

// การ์ดออเดอร์ฝั่งร้านค้า ใช้ได้ทั้งในคอลัมน์ Kanban และมุมมองการ์ด
// มีปุ่มเดียวคือ "เปลี่ยนเป็น: <สถานะถัดไป>" — ไม่มีปุ่มข้ามขั้นหรือย้อนกลับ (ตามกฎใน lib/order-status.ts)
export default function VendorOrderCard({
  order,
  variant,
  busy,
  onAdvance,
}: {
  order: Order;
  variant: "kanban" | "card";
  busy: boolean;
  onAdvance: (orderNumber: string) => void;
}) {
  const next = nextStatus(order.status);
  const isCard = variant === "card";

  return (
    <article
      aria-label={`ออเดอร์ ${order.orderNumber}`}
      className={
        isCard
          ? `flex flex-col rounded-card border border-t-[6px] border-line bg-white p-5 shadow-card ${STATUS_META[order.status].borderTop}`
          : "flex flex-col rounded-2xl bg-white p-4 shadow-card"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`leading-tight font-extrabold ${isCard ? "text-[26px]" : "text-[24px]"}`}>
            {order.orderNumber}
          </p>
          <p className="mt-1 truncate text-[18px] font-semibold">{order.customerName}</p>
          {isCard && <p className="text-[15px] text-muted">{formatTime(order.createdAt)}</p>}
        </div>
        {isCard ? (
          <OrderStatusBadge status={order.status} />
        ) : (
          <span className="shrink-0 pt-1 text-[16px] text-muted">{formatTime(order.createdAt)}</span>
        )}
      </div>

      <ul className="my-3 flex flex-col gap-1 border-y border-line py-3 text-[17px]">
        {order.items.map((item) => (
          <li key={item.foodId} className="flex justify-between gap-2">
            <span className="leading-snug">{item.foodName}</span>
            <span className="font-bold whitespace-nowrap">× {item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[17px] text-muted">ยอดรวม</span>
        <span className={`font-extrabold text-brand-dark ${isCard ? "text-[26px]" : "text-[24px]"}`}>
          {formatBaht(order.total)}
        </span>
      </div>

      <div className="mt-auto">
        {next ? (
          <button
            type="button"
            disabled={busy}
            aria-busy={busy || undefined}
            aria-label={`เปลี่ยนออเดอร์ ${order.orderNumber} เป็น ${STATUS_META[next].label}`}
            onClick={() => onAdvance(order.orderNumber)}
            className={`${btnPrimary} w-full px-3 ${isCard ? "h-[52px]" : "h-12"} ${busy ? "disabled:cursor-wait" : ""}`}
          >
            {busy ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : null}
            <span>เปลี่ยนเป็น: {STATUS_META[next].label}</span>
            {!busy && <ArrowRight className="size-5" aria-hidden="true" />}
          </button>
        ) : (
          <p
            className={`flex items-center justify-center gap-2 rounded-btn bg-sand font-bold text-done-fg ${
              isCard ? "h-[52px]" : "h-12"
            }`}
          >
            <Check className="size-5" aria-hidden="true" />
            {isCard ? "ออเดอร์เสร็จสมบูรณ์" : "เสร็จสมบูรณ์"}
          </p>
        )}
      </div>
    </article>
  );
}
