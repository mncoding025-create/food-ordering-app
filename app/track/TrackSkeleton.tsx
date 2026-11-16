import { LoadingRegion, Skeleton } from "@/components/Skeleton";

// โครงหน้าระหว่างโหลดข้อมูลออเดอร์
export function TrackSkeleton() {
  return (
    <LoadingRegion
      label="กำลังโหลดออเดอร์…"
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]"
    >
      <div className="flex flex-col gap-6 rounded-panel border border-line bg-white p-5 shadow-panel sm:p-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-72 max-w-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="flex flex-col gap-3 rounded-panel border border-line bg-white p-6 shadow-panel">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-12" />
      </div>
    </LoadingRegion>
  );
}

/** fallback ของ <Suspense> ทั้งหน้า (ยังไม่รู้ว่ามี ?no= หรือไม่) */
export function TrackPageFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-line bg-white px-5 py-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-[52px]" />
      </div>
      <TrackSkeleton />
    </div>
  );
}
