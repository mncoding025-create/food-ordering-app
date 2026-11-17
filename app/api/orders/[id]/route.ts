// GET /api/orders/[id] — ดูออเดอร์เดียว (ใช้กับหน้าติดตามออเดอร์ของลูกค้า)
// id รับได้ทั้ง "FO-0001", "fo1" หรือ "1"
// endpoint นี้เป็นสาธารณะ และเลขออเดอร์เดาได้ จึงปิดบังชื่อลูกค้าบางส่วน
import { connection, type NextRequest } from "next/server";
import { formatOrderNumber, parseOrderNumber } from "@/lib/order-rules";
import { getPrisma } from "@/lib/prisma";
import { ApiError, handleApi, json } from "@/lib/server/api";
import { toOrder } from "@/lib/server/order-mapper";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  await connection();

  return handleApi(async () => {
    const { id: raw } = await ctx.params;
    const id = parseOrderNumber(raw);
    if (id === null) {
      throw new ApiError(400, "รูปแบบเลขออเดอร์ไม่ถูกต้อง (ตัวอย่าง FO-0001)");
    }

    const order = await getPrisma().order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new ApiError(404, `ไม่พบเลขออเดอร์ ${formatOrderNumber(id)}`);
    }

    return json({ order: toOrder(order, { maskCustomer: true }) });
  });
}
