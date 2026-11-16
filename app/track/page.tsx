import { Suspense } from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import TrackClient from "./TrackClient";
import { TrackPageFallback } from "./TrackSkeleton";

export const metadata: Metadata = {
  title: "ติดตามออเดอร์ — Food Ordering",
};

export default function TrackPage() {
  return (
    <>
      <SiteHeader variant="track" />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="sr-only">ติดตามออเดอร์</h1>
        {/* useSearchParams ต้องอยู่ใน Suspense เมื่อเปิด cacheComponents */}
        <Suspense fallback={<TrackPageFallback />}>
          <TrackClient />
        </Suspense>
      </main>
    </>
  );
}
