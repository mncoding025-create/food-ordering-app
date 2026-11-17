// PATCH /api/orders/[id]/status — ร้านเปลี่ยนสถานะออเดอร์ทีละขั้น
// body: { "status": "<สถานะถัดไป>" }
//
// กฎ (ตรวจฝั่ง server เสมอ ไม่เชื่อ client):
//   * เปลี่ยนได้เฉพาะ "สถานะถัดไป" ตาม STATUS_FLOW (PENDING → PREPARING → READY → COMPLETED)
//   * ห้ามข้ามขั้น ห้ามย้อนกลับ ห้ามเปลี่ยนออเดอร์ที่เสร็จสิ้นแล้ว → 409
//   * UPDATE ... WHERE id = ? AND status = <สถานะเดิม> แบบ atomic
//     ถ้ามีคนกดเปลี่ยนไปก่อน (เช่น 2 แท็บกดพร้อมกัน) จะอัปเดตได้ 0 แถว → 409
//
// ⚠️ ยังไม่มีระบบยืนยันตัวตนของร้าน (ใบงานไม่ได้กำหนด)
import type { NextRequest } from "next/server";
import { STATUS_LABEL, formatOrderNumber, isOrderStatus, nextStatus, parseOrderNumber } from "@/lib/order-rules";
import { getPrisma } from "@/lib/prisma";
import { ApiError, handleApi, json, readJson } from "@/lib/server/api";
import { toOrder } from "@/lib/server/order-mapper";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/orders/[id]/status">) {
  return handleApi(async () => {
    const { id: raw } = await ctx.params;
    const id = parseOrderNumber(raw);
    if (id === null) {
      throw new ApiError(400, "รูปแบบเลขออเดอร์ไม่ถูกต้อง");
    }

    const body = await readJson(request);
    const requested = (body as { status?: unknown } | null)?.status;
    if (!isOrderStatus(requested)) {
      throw new ApiError(400, "สถานะที่ส่งมาไม่ถูกต้อง");
    }

    const prisma = getPrisma();
    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!current) {
      throw new ApiError(404, `ไม่พบเลขออเดอร์ ${formatOrderNumber(id)}`);
    }

    const expected = nextStatus(current.status);
    if (expected === null) {
      throw new ApiError(409, `ออเดอร์ ${formatOrderNumber(id)} เสร็จสิ้นแล้ว เปลี่ยนสถานะต่อไม่ได้`);
    }
    if (requested !== expected) {
      throw new ApiError(
        409,
        `เปลี่ยนสถานะได้เฉพาะขั้นถัดไปเท่านั้น (${STATUS_LABEL[current.status]} → ${STATUS_LABEL[expected]})`,
      );
    }

    // atomic: อัปเดตเฉพาะเมื่อสถานะในฐานข้อมูลยังเป็นค่าเดิมอยู่
    const result = await prisma.order.updateMany({
      where: { id, status: current.status },
      data: { status: expected },
    });
    if (result.count === 0) {
      throw new ApiError(409, "สถานะของออเดอร์นี้ถูกเปลี่ยนไปแล้ว กรุณารีเฟรชแล้วลองใหม่");
    }

    const updated = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    return json({ order: toOrder(updated) });
  });
}
