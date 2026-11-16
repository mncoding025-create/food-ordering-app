import type { LucideIcon } from "lucide-react";

// กล่องเส้นประสำหรับ "ยังไม่มีข้อมูล"
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-edge text-center ${
        compact ? "px-4 py-8" : "px-6 py-14"
      }`}
    >
      <Icon className={compact ? "size-10 text-input-border" : "size-14 text-input-border"} aria-hidden="true" />
      <p className="text-[20px] font-bold">{title}</p>
      {description && <p className="text-[17px] text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
