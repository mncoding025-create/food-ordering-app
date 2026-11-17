"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Inbox, RefreshCw } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import KanbanBoard from "@/components/KanbanBoard";
import { LoadingRegion, Skeleton } from "@/components/Skeleton";
import StatusSummary, { type StatusFilter } from "@/components/StatusSummary";
import VendorOrderCard from "@/components/VendorOrderCard";
import ViewToggle from "@/components/ViewToggle";
import { formatThaiDate } from "@/lib/format";
import { advanceOrder, setVendorView } from "@/lib/order-service";
import type { Order } from "@/lib/types";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { useVendorView } from "@/lib/use-client-store";
import { useOrders } from "@/lib/use-live-data";

export default function VendorClient() {
  const { data: orders, error, lastUpdated, refresh } = useOrders();
  // มุมมองที่เลือกไว้ (จำในเครื่อง) — null ระหว่าง hydrate
  const view = useVendorView();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const busyRef = useRef(false);

  async function handleAdvance(order: Order) {
    if (busyRef.current) return; // กันกดซ้ำ
    busyRef.current = true;
    setBusyOrder(order.orderNumber);
    setActionError(null);
    try {
      // server ตรวจกฎลำดับสถานะซ้ำเสมอ (ข้ามขั้น/ย้อนกลับ/มีคนเปลี่ยนก่อน → 409 พร้อมข้อความไทย)
      await advanceOrder(order.orderNumber, order.status);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "เปลี่ยนสถานะไม่สำเร็จ");
      await refresh();
    } finally {
      busyRef.current = false;
      setBusyOrder(null);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const loading = orders === undefined || view === null;
  const filtered = orders?.filter((o) => filter === "ALL" || o.status === filter) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* หัวหน้า */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[30px] leading-tight font-extrabold sm:text-[36px]">
            จัดการออเดอร์{" "}
            <span className="text-[20px] font-semibold whitespace-nowrap text-muted">
              · ทั้งหมด {orders ? orders.length : "–"} ออเดอร์
            </span>
          </h1>
          <p className="mt-1 text-[17px] text-muted">
            วันนี้ · {lastUpdated ? formatThaiDate(lastUpdated) : "…"} ·
            ออเดอร์เลื่อนไปคอลัมน์ถัดไปเมื่อกดปุ่มเปลี่ยนสถานะ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {view && <ViewToggle value={view} onChange={setVendorView} />}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${btnOutline} h-12`}
          >
            <RefreshCw className={`size-5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            รีเฟรช
          </button>
        </div>
      </div>

      {actionError && <ErrorMessage boxed>{actionError}</ErrorMessage>}
      {error && orders && <ErrorMessage boxed>อัปเดตล่าสุดไม่สำเร็จ: {error}</ErrorMessage>}

      {loading ? (
        error ? (
          <ErrorMessage boxed>{error}</ErrorMessage>
        ) : (
          <LoadingRegion
            label="กำลังโหลดออเดอร์…"
            className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-card bg-white p-3 shadow-card">
                <Skeleton className="h-10" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ))}
          </LoadingRegion>
        )
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="ยังไม่มีออเดอร์"
          description="ออเดอร์ใหม่จะขึ้นที่นี่อัตโนมัติ"
          action={
            <Link href="/menu" className={`${btnPrimary} h-12`}>
              ลองสั่งจากหน้าสั่งอาหาร
            </Link>
          }
        />
      ) : view === "kanban" ? (
        <KanbanBoard orders={orders} busyOrder={busyOrder} onAdvance={handleAdvance} />
      ) : (
        <div className="flex flex-col gap-6">
          <StatusSummary orders={orders} selected={filter} onSelect={setFilter} />
          {filtered.length === 0 ? (
            <EmptyState compact icon={Inbox} title="ไม่มีออเดอร์ในสถานะนี้" />
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-5">
              {filtered.map((order) => (
                <li key={order.orderNumber} className="flex">
                  <div className="flex w-full flex-col">
                    <VendorOrderCard
                      order={order}
                      variant="card"
                      busy={busyOrder === order.orderNumber}
                      onAdvance={handleAdvance}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
