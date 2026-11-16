import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import VendorClient from "./VendorClient";

export const metadata: Metadata = {
  title: "จัดการออเดอร์ — Food Ordering",
};

export default function VendorPage() {
  return (
    <>
      <SiteHeader variant="vendor" />
      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <VendorClient />
      </main>
    </>
  );
}
