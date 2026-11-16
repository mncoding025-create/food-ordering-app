"use client";

import { Check } from "lucide-react";
import type { Category, CategoryId } from "@/lib/types";

export type CategoryFilter = "all" | CategoryId;

// แถบ chip หมวดหมู่ — มือถือเลื่อนแนวนอน, จอกว้างขึ้นบรรทัดใหม่ได้
export default function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: CategoryFilter;
  onSelect: (value: CategoryFilter) => void;
}) {
  const options: { id: CategoryFilter; name: string }[] = [
    { id: "all", name: "ทั้งหมด" },
    ...categories,
  ];

  return (
    <div
      role="group"
      aria-label="กรองตามหมวดหมู่"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const active = option.id === selected;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option.id)}
            className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full border-2 px-[22px] font-bold whitespace-nowrap transition-colors ${
              active ? "border-brand bg-brand-tint" : "border-edge bg-white hover:bg-sand"
            }`}
          >
            {active && <Check className="size-5" aria-hidden="true" />}
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
