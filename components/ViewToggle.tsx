"use client";

import { Check } from "lucide-react";
import type { VendorView } from "@/lib/types";

const OPTIONS: { id: VendorView; label: string }[] = [
  { id: "cards", label: "การ์ด + ตัวกรอง" },
  { id: "kanban", label: "Kanban 4 คอลัมน์" },
];

// ตัวสลับมุมมองหน้าร้านค้าแบบ segmented
export default function ViewToggle({
  value,
  onChange,
}: {
  value: VendorView;
  onChange: (view: VendorView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="มุมมองรายการออเดอร์"
      className="inline-flex overflow-hidden rounded-btn border-2 border-ink bg-white"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`inline-flex h-12 items-center gap-1.5 px-3 text-[16px] font-bold whitespace-nowrap transition-colors sm:px-4 sm:text-[17px] ${
              active ? "bg-ink text-white" : "text-ink hover:bg-sand"
            }`}
          >
            {active && <Check className="size-5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
