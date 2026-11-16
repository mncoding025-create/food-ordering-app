// กฎลำดับสถานะออเดอร์ + ข้อมูลแสดงผลของแต่ละสถานะ
import { ChefHat, CircleCheck, Clock, Package, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "./types";

// ===== กฎลำดับสถานะ (สำคัญ) =====
// ออเดอร์เดินหน้าได้ทีละขั้นตามลำดับนี้เท่านั้น ห้ามข้ามขั้นและห้ามย้อนกลับ
// ตอนนี้ order-service เรียกใช้ฟังก์ชัน nextStatus() ฝั่ง client
// เมื่อมี API แล้ว ต้องเช็กกฎเดียวกันนี้ที่ฝั่ง server ด้วย (อย่าเชื่อค่าจาก client)
export const STATUS_FLOW: readonly OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
];

/** คืนสถานะถัดไป หรือ null ถ้าเป็นขั้นสุดท้ายแล้ว */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function statusIndex(status: OrderStatus): number {
  return STATUS_FLOW.indexOf(status);
}

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** คลาส Tailwind ตามสีสถานะ (พื้น/ตัวอักษร/ขอบ) */
  bg: string;
  fg: string;
  border: string;
  /** พื้นทึบด้วยสีเข้มของสถานะ ใช้กับวงกลม/กล่องไอคอน */
  solid: string;
  ring: string;
  borderTop: string;
  /** ข้อความสำหรับลูกค้าในหน้าติดตามออเดอร์ */
  customerTitle: string;
  customerMessage: (orderNumber: string) => string;
}

// เขียนชื่อคลาสเต็มๆ เพื่อให้ Tailwind สแกนเจอ (ห้ามต่อสตริงชื่อคลาสแบบไดนามิก)
export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: {
    label: "รอดำเนินการ",
    icon: Clock,
    bg: "bg-pending-bg",
    fg: "text-pending-fg",
    border: "border-pending-bd",
    solid: "bg-pending-fg",
    ring: "ring-pending-bg",
    borderTop: "border-t-pending-bd",
    customerTitle: "ร้านได้รับออเดอร์แล้ว",
    customerMessage: () => "กำลังรอคิวปรุงอาหาร หน้านี้จะอัปเดตให้อัตโนมัติ",
  },
  PREPARING: {
    label: "กำลังทำ",
    icon: ChefHat,
    bg: "bg-cooking-bg",
    fg: "text-cooking-fg",
    border: "border-cooking-bd",
    solid: "bg-cooking-fg",
    ring: "ring-cooking-bg",
    borderTop: "border-t-cooking-bd",
    customerTitle: "ร้านกำลังปรุงอาหารของคุณ",
    customerMessage: () => "รอสักครู่ หน้านี้จะอัปเดตให้อัตโนมัติเมื่อสถานะเปลี่ยน",
  },
  READY: {
    label: "พร้อมรับ",
    icon: CircleCheck,
    bg: "bg-ready-bg",
    fg: "text-ready-fg",
    border: "border-ready-bd",
    solid: "bg-ready-fg",
    ring: "ring-ready-bg",
    borderTop: "border-t-ready-bd",
    customerTitle: "อาหารของคุณพร้อมแล้ว!",
    customerMessage: (no) => `มารับที่หน้าร้านได้เลย แจ้งเลขออเดอร์ ${no} กับพนักงาน`,
  },
  COMPLETED: {
    label: "เสร็จสิ้น",
    icon: Package,
    bg: "bg-done-bg",
    fg: "text-done-fg",
    border: "border-done-bd",
    solid: "bg-done-fg",
    ring: "ring-done-bg",
    borderTop: "border-t-done-bd",
    customerTitle: "ออเดอร์เสร็จสิ้นแล้ว",
    customerMessage: () => "ขอบคุณที่ใช้บริการ",
  },
};
