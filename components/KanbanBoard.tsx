"use client";

import VendorOrderCard from "./VendorOrderCard";
import { STATUS_FLOW, STATUS_META } from "@/lib/order-status";
import type { Order } from "@/lib/types";

// มุมมอง Kanban 4 คอลัมน์ (มือถือเรียงคอลัมน์ลงแนวตั้ง)
export default function KanbanBoard({
  orders,
  busyOrder,
  onAdvance,
}: {
  orders: Order[];
  busyOrder: string | null;
  onAdvance: (order: Order) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] items-start gap-4">
      {STATUS_FLOW.map((status) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        const columnOrders = orders.filter((o) => o.status === status);
        const headingId = `kanban-${status}`;

        return (
          <section
            key={status}
            aria-labelledby={headingId}
            className={`rounded-card border-t-8 p-3 ${meta.bg} ${meta.borderTop}`}
          >
            <div className="flex items-center justify-between gap-2 px-1 pt-1 pb-3">
              <h2 id={headingId} className="flex items-center gap-2 text-[22px] font-extrabold text-ink">
                <Icon className={`size-6 ${meta.fg}`} aria-hidden="true" />
                {meta.label}
              </h2>
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-full border-2 bg-white text-[24px] font-extrabold ${meta.border}`}
              >
                {columnOrders.length}
                <span className="sr-only"> ออเดอร์</span>
              </span>
            </div>

            {columnOrders.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-black/15 px-3 py-6 text-center text-[16px] text-muted">
                ไม่มีออเดอร์
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {columnOrders.map((order) => (
                  <li key={order.orderNumber}>
                    <VendorOrderCard
                      order={order}
                      variant="kanban"
                      busy={busyOrder === order.orderNumber}
                      onAdvance={onAdvance}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
