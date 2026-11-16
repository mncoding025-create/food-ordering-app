"use client";

import { useState } from "react";
import { CATEGORY_STYLE } from "@/lib/category-style";
import type { Food } from "@/lib/types";

// พื้นที่รูปอาหาร 4:3
// - มี imageUrl → แสดงรูปจริงเต็มกรอบ
// - ไม่มีรูป หรือโหลดรูปไม่ได้ → แสดงไอคอนหมวดบนพื้นสีของหมวด
export default function FoodImage({ food }: { food: Food }) {
  const [failed, setFailed] = useState(false);
  const style = CATEGORY_STYLE[food.categoryId];
  const Icon = style.icon;
  const showPhoto = Boolean(food.imageUrl) && !failed;

  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-btn ${style.bg}`}>
      {showPhoto ? (
        // ใช้ <img> ธรรมดาตามสเปก (รูปจะอยู่ใน public/images/ ภายหลัง)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={food.imageUrl}
          alt={food.name}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid size-full place-items-center">
          <Icon className={`size-16 ${style.fg}`} strokeWidth={1.75} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
