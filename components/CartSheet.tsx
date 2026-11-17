"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import CartPanel, { type CartPanelProps } from "./CartPanel";
import { formatBaht } from "@/lib/format";
import { btnPrimary } from "@/lib/ui";

// มือถือ: แถบสรุปตะกร้าติดล่างจอ กดแล้วเปิด bottom sheet
// (ซ่อนบนจอกว้าง lg ขึ้นไป เพราะมีแผงตะกร้าด้านขวาแทน)
export default function CartSheet(props: CartPanelProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Next 16 + cacheComponents ซ่อนหน้าด้วย <Activity> แทนการ unmount
  // ปิด sheet ตอนหน้าถูกซ่อน กลับมาแล้วจะได้ไม่เจอ sheet เปิดค้าง
  useLayoutEffect(() => {
    return () => setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    // ล็อกการเลื่อนหน้าข้างหลัง
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // วนโฟกัสให้อยู่ใน sheet
      if (event.key === "Tab" && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const hasItems = props.itemCount > 0;

  return (
    <div className="lg:hidden">
      {hasItems && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-sheet">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className={`${btnPrimary} h-14 w-full justify-between text-[18px]`}
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="size-6" aria-hidden="true" />
              ตะกร้า {props.itemCount} รายการ
            </span>
            <span className="font-extrabold">
              {formatBaht(props.total)} <span className="sr-only">ดูตะกร้า</span>
            </span>
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[rgba(28,25,23,0.55)]"
            onClick={() => setOpen(false)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-panel bg-white px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-sheet"
          >
            <div aria-hidden="true" className="mx-auto mb-4 h-[5px] w-11 rounded-full bg-edge" />
            <CartPanel
              {...props}
              variant="sheet"
              titleId={titleId}
              headerAction={
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="ปิดตะกร้า"
                  onClick={() => setOpen(false)}
                  className="grid size-12 place-items-center rounded-btn bg-sand hover:bg-line"
                >
                  <X className="size-6" aria-hidden="true" />
                </button>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
