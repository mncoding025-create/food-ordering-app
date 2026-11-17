// /api/orders
//   GET  — รายการออเดอร์สำหรับหน้าร้าน (ใหม่สุดก่อน) + จำนวนต่อสถานะ, กรองด้วย ?status=
//   POST — ลูกค้าสร้างออเดอร์ใหม่
//
// ⚠️ ยังไม่มีระบบยืนยันตัวตนของร้าน (ใบงานไม่ได้กำหนด) — ใครรู้ URL ก็เรียก GET นี้ได้
import { connection, type NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import {
  MAX_ORDER_LINES,
  MAX_QUANTITY,
  STATUS_FLOW,
  isOrderStatus,
  validateCustomerName,
} from "@/lib/order-rules";
import { getPrisma } from "@/lib/prisma";
import { ApiError, handleApi, json, readJson } from "@/lib/server/api";
import { toOrder } from "@/lib/server/order-mapper";
import type { OrderStatus } from "@/lib/types";

const LIST_LIMIT = 200;

export async function GET(request: NextRequest) {
  await connection();

  return handleApi(async () => {
    const statusParam = request.nextUrl.searchParams.get("status");
    if (statusParam !== null && !isOrderStatus(statusParam)) {
      throw new ApiError(400, "สถานะที่ใช้กรองไม่ถูกต้อง");
    }

    const prisma = getPrisma();
    const [orders, grouped] = await Promise.all([
      prisma.order.findMany({
        where: statusParam ? { status: statusParam } : undefined,
        include: { items: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: LIST_LIMIT,
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const counts = Object.fromEntries(STATUS_FLOW.map((s) => [s, 0])) as Record<OrderStatus, number>;
    for (const row of grouped) counts[row.status] = row._count._all;
    const all = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return json({
      orders: orders.map((order) => toOrder(order)),
      counts: { ALL: all, ...counts },
    });
  });
}

/** ตรวจ body ของ POST แล้วคืนค่าที่สะอาด (รวม foodId ซ้ำเป็นบรรทัดเดียว) */
function parseCreateOrderBody(body: unknown): { customerName: string; items: Map<string, number> } {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "ข้อมูลที่ส่งมาไม่ถูกต้อง");
  }
  const { customerName, items } = body as { customerName?: unknown; items?: unknown };

  if (typeof customerName !== "string") {
    throw new ApiError(400, "กรุณากรอกชื่อก่อนยืนยันออเดอร์");
  }
  const nameError = validateCustomerName(customerName);
  if (nameError) throw new ApiError(400, nameError);

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "ตะกร้ายังว่างอยู่ กรุณาเลือกเมนูก่อน");
  }
  if (items.length > MAX_ORDER_LINES) {
    throw new ApiError(400, "รายการในออเดอร์มากเกินไป");
  }

  const merged = new Map<string, number>();
  for (const item of items) {
    const { foodId, quantity } = (item ?? {}) as { foodId?: unknown; quantity?: unknown };
    if (typeof foodId !== "string" || foodId.length === 0 || foodId.length > 10) {
      throw new ApiError(400, "มีรายการอาหารที่ไม่ถูกต้อง");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new ApiError(400, `จำนวนต่อเมนูต้องอยู่ระหว่าง 1–${MAX_QUANTITY}`);
    }
    const total = (merged.get(foodId) ?? 0) + quantity;
    if (total > MAX_QUANTITY) {
      throw new ApiError(400, `จำนวนต่อเมนูต้องไม่เกิน ${MAX_QUANTITY}`);
    }
    merged.set(foodId, total);
  }

  return { customerName: customerName.trim(), items: merged };
}

export async function POST(request: NextRequest) {
  return handleApi(async () => {
    const { customerName, items } = parseCreateOrderBody(await readJson(request));
    const prisma = getPrisma();

    const order = await prisma.$transaction(async (tx) => {
      // ค้นราคาจากฐานข้อมูลเท่านั้น — ไม่เชื่อราคา/ยอดรวมที่ client ส่งมา
      const foods = await tx.food.findMany({
        where: { id: { in: [...items.keys()] }, isAvailable: true },
      });
      if (foods.length !== items.size) {
        throw new ApiError(400, "มีเมนูที่ไม่มีหรือปิดขายแล้ว กรุณาลบออกจากตะกร้าแล้วลองใหม่");
      }

      // คำนวณด้วย Decimal (ไม่ใช้ทศนิยมแบบ float) ให้ตรงกับ CHECK line_total = unit_price * quantity
      const lines = foods.map((food) => {
        const quantity = items.get(food.id)!;
        return {
          foodId: food.id,
          foodName: food.name,
          unitPrice: food.price,
          quantity,
          lineTotal: food.price.mul(quantity),
        };
      });
      const totalPrice = lines.reduce((sum, line) => sum.add(line.lineTotal), new Prisma.Decimal(0));

      // order + order_item ถูกสร้างใน transaction เดียว (สำเร็จทั้งหมดหรือไม่บันทึกเลย)
      return tx.order.create({
        data: {
          customerName,
          totalPrice,
          items: { create: lines },
        },
        include: { items: true },
      });
    });

    return json({ order: toOrder(order) }, 201);
  });
}
