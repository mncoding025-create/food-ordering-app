"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/order-service";

// ตัวปรับจำนวน − จำนวน +  (ปุ่ม 48px ในการ์ดเมนู, 44px ในตะกร้า)
export default function QuantityStepper({
  name,
  quantity,
  onChange,
  size = "lg",
}: {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
  size?: "lg" | "md";
}) {
  const box = size === "lg" ? "size-12" : "size-11";
  return (
    <div role="group" aria-label={`จำนวน ${name}`} className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`ลดจำนวน ${name}`}
        onClick={() => onChange(quantity - 1)}
        className={`${box} grid shrink-0 place-items-center rounded-btn border-2 border-ink bg-white hover:bg-sand`}
      >
        <Minus className="size-5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-9 flex-1 text-center text-[22px] leading-none font-extrabold tabular-nums"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`เพิ่มจำนวน ${name}`}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        className={`${box} grid shrink-0 place-items-center rounded-btn bg-brand text-ink hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:bg-brand-soft`}
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
