import { formatBaht } from "@/lib/format";
import type { Order } from "@/lib/types";

// การ์ด "รายการอาหาร" ในหน้าติดตามออเดอร์
export default function OrderItemsCard({ order }: { order: Order }) {
  return (
    <section
      aria-labelledby="order-items-title"
      className="rounded-panel border border-line bg-white p-6 shadow-panel"
    >
      <h2 id="order-items-title" className="text-[22px] font-extrabold">
        รายการอาหาร
      </h2>
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {order.items.map((item) => (
          <li key={item.foodId} className="flex items-start justify-between gap-3 py-3">
            <span className="text-[18px] leading-snug">
              {item.foodName} <span className="font-bold whitespace-nowrap">× {item.quantity}</span>
            </span>
            <span className="text-[18px] font-bold whitespace-nowrap">
              {formatBaht(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t-2 border-line pt-4">
        <span className="text-[20px] font-semibold">ยอดรวม</span>
        <span className="text-[32px] font-extrabold text-brand-dark">{formatBaht(order.total)}</span>
      </div>
    </section>
  );
}
