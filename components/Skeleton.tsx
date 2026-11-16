// กล่องเทาๆ กะพริบ แทนเนื้อหาระหว่างโหลด
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-btn bg-sand ${className}`} />;
}

/** ห่อกลุ่ม skeleton ให้โปรแกรมอ่านหน้าจอรู้ว่ากำลังโหลด */
export function LoadingRegion({
  label = "กำลังโหลด…",
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
