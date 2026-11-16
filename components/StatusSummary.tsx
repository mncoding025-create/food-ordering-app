"use client";

import { Check, LayoutGrid } from "lucide-react";
import { STATUS_FLOW, STATUS_META } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/lib/types";

export type StatusFilter = "ALL" | OrderStatus;

// การ์ดสรุป 5 ใบ (ทั้งหมด + 4 สถานะ) กดเพื่อกรองรายการออเดอร์
export default function StatusSummary({
  orders,
  selected,
  onSelect,
}: {
  orders: Order[];
  selected: StatusFilter;
  onSelect: (value: StatusFilter) => void;
}) {
  const options = [
    {
      id: "ALL" as const,
      label: "ทั้งหมด",
      icon: LayoutGrid,
      count: orders.length,
      selectedClass: "border-4 border-ink bg-sand p-4",
      iconClass: "text-ink",
    },
    ...STATUS_FLOW.map((status) => {
      const meta = STATUS_META[status];
      return {
        id: status,
        label: meta.label,
        icon: meta.icon,
        count: orders.filter((o) => o.status === status).length,
        selectedClass: `border-4 p-4 ${meta.border} ${meta.bg}`,
        iconClass: meta.fg,
      };
    }),
  ];

  return (
    <div
      role="group"
      aria-label="กรองตามสถานะ"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-4"
    >
      {options.map((option) => {
        const active = option.id === selected;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option.id)}
            className={`flex flex-col items-start rounded-card text-left transition-colors ${
              active ? option.selectedClass : "border-2 border-line bg-white p-[18px] hover:bg-sand"
            }`}
          >
            <span className="flex items-center gap-2 text-[18px] font-bold">
              <Icon className={`size-5 ${option.iconClass}`} aria-hidden="true" />
              {option.label}
            </span>
            <span className="mt-1 text-[52px] leading-none font-extrabold tabular-nums">{option.count}</span>
            {/* จองพื้นที่ไว้เสมอ การ์ดจะได้ไม่กระโดดตอนเลือก */}
            <span
              className={`mt-2 inline-flex items-center gap-1 text-[15px] font-bold ${active ? "" : "invisible"}`}
              aria-hidden={!active}
            >
              <Check className="size-4" aria-hidden="true" />
              กำลังแสดง
            </span>
          </button>
        );
      })}
    </div>
  );
}
