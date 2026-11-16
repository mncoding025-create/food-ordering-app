import { STATUS_META } from "@/lib/order-status";
import type { Order } from "@/lib/types";

// กล่องอธิบายสถานะเป็นภาษาคนทั่วไป (role="status" ให้โปรแกรมอ่านหน้าจอประกาศเมื่อเปลี่ยน)
export default function StatusMessage({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  const Icon = meta.icon;

  return (
    <div
      role="status"
      className={`flex items-center gap-4 rounded-card border-2 px-5 py-5 sm:px-6 ${meta.bg} ${meta.fg} ${meta.border}`}
    >
      <span className={`grid size-14 shrink-0 place-items-center rounded-btn text-white ${meta.solid}`}>
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[22px] leading-tight font-extrabold sm:text-[26px]">{meta.customerTitle}</p>
        <p className="mt-1 text-[17px] sm:text-[18px]">{meta.customerMessage(order.orderNumber)}</p>
      </div>
    </div>
  );
}
