import { CircleAlert } from "lucide-react";

// ข้อความ error รูปแบบเดียวกันทั้งเว็บ (ไอคอนแดง + role="alert")
export default function ErrorMessage({
  id,
  children,
  boxed = false,
}: {
  id?: string;
  children: React.ReactNode;
  boxed?: boolean;
}) {
  return (
    <p
      id={id}
      role="alert"
      className={`flex items-start gap-2 text-[16px] font-semibold text-danger ${
        boxed ? "rounded-btn border-2 border-danger-bd bg-danger-bg px-4 py-3" : "mt-2"
      }`}
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
