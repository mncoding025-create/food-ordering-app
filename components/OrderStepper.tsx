import { Check } from "lucide-react";
import { STATUS_FLOW, STATUS_META, statusIndex } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

// Stepper 4 ขั้น: มือถือเป็นแนวตั้ง, จอ sm ขึ้นไปเป็นแนวนอน
// ขั้นที่ผ่านแล้ว = วงกลมเทาเข้ม + เครื่องหมายถูก, ขั้นปัจจุบัน = วงกลมใหญ่สีสถานะ, ขั้นที่ยังไม่ถึง = เส้นประ
export default function OrderStepper({ status }: { status: OrderStatus }) {
  const current = statusIndex(status);

  return (
    <ol aria-label="ขั้นตอนของออเดอร์" className="flex flex-col sm:flex-row">
      {STATUS_FLOW.map((step, index) => {
        const meta = STATUS_META[step];
        const Icon = meta.icon;
        const state = index < current ? "done" : index === current ? "current" : "todo";
        const isLast = index === STATUS_FLOW.length - 1;
        // เส้นเชื่อมไปขั้นถัดไป ทึบถ้าขั้นถัดไปผ่านมาแล้วหรือเป็นขั้นปัจจุบัน
        const connectorDone = index + 1 <= current;

        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className="relative flex items-center gap-4 pb-5 last:pb-0 sm:flex-1 sm:flex-col sm:gap-3 sm:pb-0 sm:text-center"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute top-[60px] bottom-0 left-[28px] border-l-4 sm:top-[38px] sm:right-[-50%] sm:bottom-auto sm:left-1/2 sm:border-t-4 sm:border-l-0 ${
                  connectorDone ? "border-solid border-done-fg" : "border-dashed border-input-border"
                }`}
              />
            )}

            <span className="relative z-10 grid size-[60px] shrink-0 place-items-center sm:h-20 sm:w-full">
              {state === "done" && (
                <span className="grid size-12 place-items-center rounded-full bg-done-fg text-white sm:size-16">
                  <Check className="size-6 sm:size-8" strokeWidth={3} aria-hidden="true" />
                </span>
              )}
              {state === "current" && (
                <span
                  className={`grid size-[60px] place-items-center rounded-full text-white ring-4 sm:size-20 sm:ring-[6px] ${meta.solid} ${meta.ring}`}
                >
                  <Icon className="size-7 sm:size-9" aria-hidden="true" />
                </span>
              )}
              {state === "todo" && (
                <span className="grid size-12 place-items-center rounded-full border-[3px] border-dashed border-input-border bg-white text-input-border sm:size-16">
                  <Icon className="size-6 sm:size-7" aria-hidden="true" />
                </span>
              )}
            </span>

            <span className="flex flex-col items-start gap-1 sm:items-center">
              <span
                className={`text-[18px] leading-tight ${
                  state === "current"
                    ? `font-extrabold ${meta.fg}`
                    : state === "done"
                      ? "font-bold text-ink"
                      : "font-semibold text-muted"
                }`}
              >
                {meta.label}
              </span>
              {state === "done" && (
                <span className="rounded-full bg-done-bg px-2.5 py-0.5 text-[14px] font-bold text-done-fg">
                  ผ่านแล้ว
                </span>
              )}
              {state === "current" && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[14px] font-bold text-white ${meta.solid}`}
                >
                  ตอนนี้
                </span>
              )}
              {state === "todo" && <span className="sr-only">ยังไม่ถึง</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
