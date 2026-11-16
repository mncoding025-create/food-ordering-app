"use client";

import { Check, Plus } from "lucide-react";
import FoodImage from "./FoodImage";
import QuantityStepper from "./QuantityStepper";
import { formatBaht } from "@/lib/format";
import { btnPrimary } from "@/lib/ui";
import type { Food } from "@/lib/types";

export default function FoodCard({
  food,
  quantity,
  onQuantityChange,
}: {
  food: Food;
  /** จำนวนในตะกร้า (0 = ยังไม่อยู่ในตะกร้า) */
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  const inCart = quantity > 0;

  return (
    <article
      className={`flex flex-col rounded-card border-2 bg-white p-3 shadow-card transition-colors ${
        inCart ? "border-brand" : "border-transparent"
      }`}
    >
      <div className="relative">
        <FoodImage food={food} />
        {inCart && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[14px] font-bold text-white">
            <Check className="size-4" aria-hidden="true" />
            ในตะกร้าแล้ว
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <h3 className="text-[19px] leading-snug font-bold sm:text-[20px]">{food.name}</h3>
        <p className="mt-1 line-clamp-2 text-[15px] leading-normal text-muted">{food.description}</p>
        <p className="mt-auto pt-2 pb-3 text-[22px] font-extrabold text-brand-dark">
          {formatBaht(food.price)}
        </p>

        {inCart ? (
          <QuantityStepper name={food.name} quantity={quantity} onChange={onQuantityChange} />
        ) : (
          <button
            type="button"
            onClick={() => onQuantityChange(1)}
            className={`${btnPrimary} h-12 w-full px-2 text-[17px]`}
          >
            <Plus className="size-5 shrink-0" aria-hidden="true" />
            เพิ่มลงตะกร้า
          </button>
        )}
      </div>
    </article>
  );
}
