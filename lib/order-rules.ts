// กฎกลางของระบบออเดอร์ — ใช้ร่วมกันทั้งฝั่ง server (API) และฝั่ง client (UI)
// ไฟล์นี้ต้องไม่ import อะไรที่ผูกกับ UI (ไอคอน/สี) หรือฐานข้อมูล
import type { OrderStatus } from "./types";

// ===== กฎลำดับสถานะ (สำคัญ) =====
// ออเดอร์เดินหน้าได้ทีละขั้นตามลำดับนี้เท่านั้น ห้ามข้ามขั้นและห้ามย้อนกลับ
// UI ใช้เพื่อแสดงปุ่ม "เปลี่ยนเป็น: <ถัดไป>" ส่วน API (PATCH /api/orders/[id]/status) ใช้ตรวจซ้ำเสมอ
export const STATUS_FLOW: readonly OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (STATUS_FLOW as readonly string[]).includes(value);
}

/** คืนสถานะถัดไป หรือ null ถ้าเป็นขั้นสุดท้ายแล้ว */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function statusIndex(status: OrderStatus): number {
  return STATUS_FLOW.indexOf(status);
}

/** ชื่อสถานะภาษาไทย (ใช้ในข้อความ error ฝั่ง server ด้วย) */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "รอดำเนินการ",
  PREPARING: "กำลังทำ",
  READY: "พร้อมรับ",
  COMPLETED: "เสร็จสิ้น",
};

// ===== ตะกร้า / การสั่ง =====

export const MAX_QUANTITY = 99;
export const MAX_ORDER_LINES = 50;

/** ตรวจชื่อลูกค้า คืนข้อความ error ภาษาไทย หรือ null ถ้าผ่าน */
export function validateCustomerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "กรุณากรอกชื่อก่อนยืนยันออเดอร์";
  if (trimmed.length < 2) return "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร";
  if (trimmed.length > 50) return "ชื่อยาวเกินไป (ไม่เกิน 50 ตัวอักษร)";
  return null;
}

// ===== เลขออเดอร์ =====
// ในฐานข้อมูลเก็บเป็นตัวเลข (order_026_tb.id) แต่แสดงผลเป็น FO-0001

export function formatOrderNumber(id: number): string {
  return `FO-${String(id).padStart(4, "0")}`;
}

/** แปลง "7", "fo7", "FO-0007" → 7  (ผิดรูปแบบ → null) */
export function parseOrderNumber(input: string): number | null {
  const digits = input.trim().toUpperCase().replace(/^FO-?/, "");
  if (!/^\d{1,9}$/.test(digits)) return null;
  const id = Number(digits);
  return id >= 1 && id <= 4294967295 ? id : null;
}

/** แปลงสิ่งที่ผู้ใช้พิมพ์ให้เป็นรูปแบบ FO-0007 (ถ้าแปลงไม่ได้ คืนค่าเดิมแบบตัวพิมพ์ใหญ่) */
export function normalizeOrderNumber(input: string): string {
  const id = parseOrderNumber(input);
  return id === null ? input.trim().toUpperCase() : formatOrderNumber(id);
}

/** ปิดบังชื่อบางส่วนสำหรับหน้าติดตามออเดอร์ (สาธารณะ) เช่น "สมชาย" → "สม***" */
export function maskName(name: string): string {
  const chars = Array.from(name.trim());
  const visible = chars.length <= 2 ? 1 : 2;
  return `${chars.slice(0, visible).join("")}***`;
}
