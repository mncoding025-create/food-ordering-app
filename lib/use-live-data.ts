"use client";

// hook สำหรับดึงข้อมูลออเดอร์แบบอัปเดตอัตโนมัติ
// - โหลดครั้งแรกใน useEffect (ไม่อ่าน storage ตอน render จึงไม่เกิด hydration error)
// - ฟัง event เมื่อข้อมูลเปลี่ยน (อีกแท็บสั่งอาหาร/เปลี่ยนสถานะ)
// - โพลซ้ำทุก 4 วินาที เผื่อ event หลุด (และใช้ต่อได้เมื่อเปลี่ยนเป็น API จริง)
import { useCallback, useEffect, useRef, useState } from "react";
import { getOrder, listOrders, subscribeOrders } from "./order-service";
import type { Order } from "./types";

const POLL_MS = 4000;

interface LiveState<T> {
  /** undefined = กำลังโหลดครั้งแรก */
  data: T | undefined;
  error: string | null;
  lastUpdated: Date | null;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

function useLiveData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<LiveState<T>>({
    data: undefined,
    error: null,
    lastUpdated: null,
  });
  // นับรอบการขอข้อมูล เพื่อทิ้งผลลัพธ์เก่าที่มาถึงช้ากว่า
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await fetcher();
      if (id !== requestId.current) return;
      setState({ data, error: null, lastUpdated: new Date() });
    } catch (error) {
      if (id !== requestId.current) return;
      setState((prev) => ({ ...prev, error: messageOf(error) }));
    }
  }, [fetcher]);

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeOrders(() => void refresh());
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh]);

  return { ...state, loading: state.data === undefined && state.error === null, refresh };
}

/** รายการออเดอร์ทั้งหมด (ใหม่สุดก่อน) */
export function useOrders() {
  return useLiveData(listOrders);
}

/** ออเดอร์เดียวตามเลข — data เป็น null เมื่อไม่พบ */
export function useOrder(orderNumber: string) {
  const fetcher = useCallback(() => getOrder(orderNumber), [orderNumber]);
  return useLiveData<Order | null>(fetcher);
}
