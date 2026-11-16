"use client";

// อ่านค่าที่เก็บในเครื่อง (ตะกร้า, มุมมองหน้าร้าน) ด้วย useSyncExternalStore
// - ตอน render ฝั่ง server และตอน hydrate จะใช้ค่า "server snapshot" (ตะกร้าว่าง / null)
// - หลัง hydrate React จะอ่านค่าจริงจากเครื่องแล้ว render ใหม่ให้เอง → ไม่มี hydration error
import { useSyncExternalStore } from "react";
import {
  EMPTY_CART,
  getVendorView,
  loadCart,
  subscribeCart,
  subscribeVendorView,
} from "./order-service";
import type { CartItem, VendorView } from "./types";

const serverCart = () => EMPTY_CART;
const serverView = () => null;

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribeCart, loadCart, serverCart);
}

/** คืน null ระหว่างที่ยังไม่รู้ค่าจริง (ฝั่ง server/ตอน hydrate) */
export function useVendorView(): VendorView | null {
  return useSyncExternalStore<VendorView | null>(subscribeVendorView, getVendorView, serverView);
}
