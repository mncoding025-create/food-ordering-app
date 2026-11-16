// ไอคอนและสีของแต่ละหมวด (ใช้ในพื้นที่รูปอาหารเมื่อยังไม่มีรูปจริง)
import { CupSoda, IceCreamCone, Soup, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { CategoryId } from "./types";

export const CATEGORY_STYLE: Record<CategoryId, { icon: LucideIcon; bg: string; fg: string }> = {
  rice: { icon: UtensilsCrossed, bg: "bg-cat-rice-bg", fg: "text-cat-rice-fg" },
  noodle: { icon: Soup, bg: "bg-cat-noodle-bg", fg: "text-cat-noodle-fg" },
  drink: { icon: CupSoda, bg: "bg-cat-drink-bg", fg: "text-cat-drink-fg" },
  dessert: { icon: IceCreamCone, bg: "bg-cat-dessert-bg", fg: "text-cat-dessert-fg" },
};
