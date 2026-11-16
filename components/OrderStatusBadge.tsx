import { STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

// ป้ายสถานะ: ใช้ทั้งไอคอน ข้อความ และสี (ไม่สื่อด้วยสีอย่างเดียว)
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[15px] font-bold whitespace-nowrap ${meta.bg} ${meta.fg} ${meta.border}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
