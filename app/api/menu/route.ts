// GET /api/menu — หมวดหมู่ + เมนูที่พร้อมขาย เรียงตาม sort_order
import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { handleApi, json } from "@/lib/server/api";
import { toCategory, toFood } from "@/lib/server/order-mapper";

export async function GET() {
  // cacheComponents: บังคับให้รันตอนมี request จริงเท่านั้น (ไม่ prerender / ไม่ต่อ DB ตอน build)
  await connection();

  return handleApi(async () => {
    const prisma = getPrisma();
    const [categories, foods] = await Promise.all([
      prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
      prisma.food.findMany({
        where: { isAvailable: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      }),
    ]);

    return json({
      categories: categories.map(toCategory),
      foods: foods.map(toFood),
    });
  });
}
