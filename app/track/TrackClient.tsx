"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { History, RefreshCw } from "lucide-react";
import ErrorMessage from "@/components/ErrorMessage";
import OrderItemsCard from "@/components/OrderItemsCard";
import OrderNotFound from "@/components/OrderNotFound";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderStepper from "@/components/OrderStepper";
import StatusMessage from "@/components/StatusMessage";
import TrackSearch from "@/components/TrackSearch";
import { TrackSkeleton } from "./TrackSkeleton";
import { formatTime } from "@/lib/format";
import { getRecentOrderNumbers, normalizeOrderNumber } from "@/lib/order-service";
import { btnPrimary, pill } from "@/lib/ui";
import { useOrder } from "@/lib/use-live-data";

// อ่าน ?no= จาก URL — คอมโพเนนต์นี้ต้องอยู่ใน <Suspense> (cacheComponents)
export default function TrackClient() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("no")?.trim() ?? "";

  if (!raw) return <NoOrderNumber />;

  const orderNumber = normalizeOrderNumber(raw);
  // key ทำให้เริ่มโหลดใหม่ทุกครั้งที่เลขออเดอร์ใน URL เปลี่ยน
  return <OrderLookup key={orderNumber} orderNumber={orderNumber} />;
}

function OrderLookup({ orderNumber }: { orderNumber: string }) {
  const { data: order, error, lastUpdated } = useOrder(orderNumber);
  const inputRef = useRef<HTMLInputElement>(null);

  if (order === undefined && !error) {
    return (
      <div className="flex flex-col gap-6">
        <TrackSearch defaultValue={orderNumber} />
        <TrackSkeleton />
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <TrackSearch defaultValue={orderNumber} />
        <ErrorMessage boxed>{error}</ErrorMessage>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <TrackSearch defaultValue={orderNumber} invalid inputRef={inputRef} />
        <OrderNotFound
          orderNumber={orderNumber}
          onRetry={() => {
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TrackSearch defaultValue={order.orderNumber} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section
          aria-labelledby="order-number"
          className="flex flex-col gap-7 rounded-panel border border-line bg-white p-5 shadow-panel sm:p-8"
        >
          <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row">
            <div>
              <p className="text-[17px] text-muted">เลขออเดอร์ของคุณ</p>
              <p
                id="order-number"
                className="text-[52px] leading-none font-extrabold tracking-tight sm:text-[72px]"
              >
                {order.orderNumber}
              </p>
              <p className="mt-3 text-[20px] font-semibold">{order.customerName}</p>
              <p className="text-[16px] text-muted">สั่งเมื่อ {formatTime(order.createdAt)}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className={pill}>
                <RefreshCw className="size-4" aria-hidden="true" />
                อัปเดตอัตโนมัติ{lastUpdated && ` · ล่าสุด ${formatTime(lastUpdated)}`}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <OrderStepper status={order.status} />
          <StatusMessage order={order} />
          {error && <ErrorMessage boxed>อัปเดตล่าสุดไม่สำเร็จ: {error}</ErrorMessage>}
        </section>

        <OrderItemsCard order={order} />
      </div>
    </div>
  );
}

// ยังไม่มีเลขใน URL: ช่องค้นหา + เลขออเดอร์ล่าสุดของเครื่องนี้
function NoOrderNumber() {
  const [recent, setRecent] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    getRecentOrderNumbers().then((list) => {
      if (alive) setRecent(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div>
        {/* หัวข้อที่มองเห็น (h1 จริงอยู่ใน page.tsx แบบ sr-only จึงซ่อนตัวนี้จากโปรแกรมอ่านหน้าจอ) */}
        <p aria-hidden="true" className="text-[30px] leading-tight font-extrabold sm:text-[36px]">
          ติดตามออเดอร์
        </p>
        <p className="mt-1 text-[18px] text-muted">
          ใส่เลขออเดอร์ที่ได้หลังสั่งอาหาร เช่น FO-0001 แล้วกด “ค้นหา”
        </p>
      </div>

      <TrackSearch />

      {recent && recent.length > 0 && (
        <section aria-labelledby="recent-title" className="rounded-card border border-line bg-white px-5 py-4">
          <h3 id="recent-title" className="flex items-center gap-2 text-[17px] font-bold">
            <History className="size-5" aria-hidden="true" />
            ออเดอร์ล่าสุดของเครื่องนี้
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recent.map((no) => (
              <li key={no}>
                <Link
                  href={`/track?no=${encodeURIComponent(no)}`}
                  className="inline-flex h-12 items-center rounded-full border-2 border-edge bg-white px-5 text-[18px] font-bold hover:border-brand hover:bg-brand-tint"
                >
                  {no}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent && recent.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-edge px-6 py-10 text-center">
          <History className="size-12 text-input-border" aria-hidden="true" />
          <p className="text-[20px] font-bold">ยังไม่มีออเดอร์จากเครื่องนี้</p>
          <p className="text-[17px] text-muted">สั่งอาหารก่อน แล้วเลขออเดอร์จะมาแสดงที่นี่</p>
          <Link href="/menu" className={`${btnPrimary} mt-3 h-12`}>
            ไปสั่งอาหาร
          </Link>
        </div>
      )}
    </div>
  );
}
