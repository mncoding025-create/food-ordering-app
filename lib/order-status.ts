// ข้อมูลแสดงผลของแต่ละสถานะ (ไอคอน สี ข้อความสำหรับลูกค้า) — ใช้ฝั่ง UI
// กฎลำดับสถานะย้ายไปอยู่ที่ lib/order-rules.ts (ใช้ร่วมกับ API ฝั่ง server)
// re-export ไว้ตรงนี้เพื่อให้คอมโพเนนต์เดิม import ได้เหมือนเดิม
import { ChefHat, CircleCheck, Clock, Package, type LucideIcon } from "lucide-react";
import { STATUS_LABEL } from "./order-rules";
import type { OrderStatus } from "./types";

export { STATUS_FLOW, nextStatus, statusIndex } from "./order-rules";

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
    label: STATUS_LABEL.PENDING,
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
    label: STATUS_LABEL.PREPARING,
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
    label: STATUS_LABEL.READY,
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
    label: STATUS_LABEL.COMPLETED,
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
