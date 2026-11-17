// แปลงข้อมูลจาก Prisma (Decimal, Date, id ตัวเลข) → type เดิมที่ UI ใช้ (lib/types.ts)
import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { formatOrderNumber, maskName } from "@/lib/order-rules";
import type { Category, CategoryId, Food, Order } from "@/lib/types";

type DbOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
type DbFood = Prisma.FoodGetPayload<object>;
type DbCategory = Prisma.CategoryGetPayload<object>;

export function toCategory(row: DbCategory): Category {
  return { id: row.id as CategoryId, name: row.name };
}

export function toFood(row: DbFood): Food {
  return {
    id: row.id,
    categoryId: row.categoryId as CategoryId,
    name: row.name,
    description: row.description,
    price: row.price.toNumber(),
    imageEmoji: row.imageEmoji ?? "",
    imageUrl: row.imageUrl ?? undefined,
  };
}

/**
 * @param maskCustomer true = ปิดบังชื่อลูกค้า (ใช้กับ endpoint สาธารณะของหน้าติดตามออเดอร์)
 */
export function toOrder(row: DbOrder, { maskCustomer = false } = {}): Order {
  return {
    orderNumber: formatOrderNumber(row.id),
    customerName: maskCustomer ? maskName(row.customerName) : row.customerName,
    items: [...row.items]
      .sort((a, b) => a.id - b.id)
      .map((item) => ({
        foodId: item.foodId,
        foodName: item.foodName,
        price: item.unitPrice.toNumber(),
        quantity: item.quantity,
      })),
    total: row.totalPrice.toNumber(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
