import Link from "next/link";
import { ChevronLeft, RefreshCw, Search, Soup, Store } from "lucide-react";
import { btnOutline, pill } from "@/lib/ui";

type Variant = "customer" | "track" | "vendor";

const MAX_WIDTH: Record<Variant, string> = {
  customer: "max-w-[1280px]",
  track: "max-w-[1100px]",
  vendor: "max-w-[1360px]",
};

// header ต่างกันตามฝั่งผู้ใช้ (ดู design/DESIGN-SPEC.md หัวข้อ "ทั่วไป")
export default function SiteHeader({ variant }: { variant: Variant }) {
  const isVendor = variant === "vendor";

  return (
    <header className="border-b border-line bg-white">
      <div
        className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${MAX_WIDTH[variant]}`}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-btn">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-btn sm:size-11 ${
              isVendor ? "bg-ink text-white" : "bg-brand text-ink"
            }`}
          >
            {isVendor ? (
              <Store className="size-6" aria-hidden="true" />
            ) : (
              <Soup className="size-6" aria-hidden="true" />
            )}
          </span>
          <span className="truncate text-[20px] leading-tight font-extrabold sm:text-[24px]">
            Food Ordering
            {isVendor && (
              <span className="hidden font-semibold text-muted sm:inline"> · หน้าร้านค้า</span>
            )}
          </span>
        </Link>

        {variant === "customer" && (
          <Link href="/track" className={`${btnOutline} h-12 shrink-0`}>
            <Search className="size-5" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">ติดตามออเดอร์</span>
            <span className="min-[380px]:hidden">ติดตาม</span>
          </Link>
        )}

        {variant === "track" && (
          <Link href="/menu" className={`${btnOutline} h-12 shrink-0`}>
            <ChevronLeft className="size-5" aria-hidden="true" />
            กลับไปเมนู
          </Link>
        )}

        {isVendor && (
          <span className={`${pill} shrink-0`}>
            <RefreshCw className="size-4" aria-hidden="true" />
            อัปเดตอัตโนมัติ
          </span>
        )}
      </div>
    </header>
  );
}
