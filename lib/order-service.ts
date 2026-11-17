// ชั้นบริการ (service) ฝั่ง client — หน้าต่างๆ เรียกผ่านไฟล์นี้เท่านั้น
// เมนูและออเดอร์: เรียก API ของเรา (app/api/*) ซึ่งคุยกับฐานข้อมูลฝั่ง server
//   → client ไม่เคยเข้าถึงฐานข้อมูลตรงๆ และไม่ส่งราคาไปให้ server (server ค้นราคาเอง)
// ตะกร้า / เลขออเดอร์ล่าสุด / มุมมองหน้าร้าน: เก็บในเครื่องลูกค้า (localStorage ผ่าน lib/storage.ts)
import { MAX_QUANTITY, nextStatus, normalizeOrderNumber, STATUS_LABEL } from "./order-rules";
import { readJSON, readRaw, subscribeKey, writeJSON } from "./storage";
import type { CartItem, Category, Food, Order, OrderStatus, VendorView } from "./types";

// ใช้ต่อจากที่เดิมได้ (คอมโพเนนต์เดิม import จากไฟล์นี้)
export { MAX_QUANTITY, normalizeOrderNumber, validateCustomerName } from "./order-rules";

const KEYS = {
  /** สัญญาณ "ข้อมูลออเดอร์เปลี่ยน" ให้แท็บอื่นในเครื่องเดียวกันโหลดใหม่ทันที */
  ordersPing: "fo:orders-ping",
  recent: "fo:recent-orders",
  cart: "fo:cart",
  vendorView: "fo:vendor-view",
} as const;

const MAX_RECENT = 5;
const REQUEST_TIMEOUT_MS = 10_000;

// ---------- ตัวช่วยเรียก API ----------

/** error จาก API (ข้อความเป็นภาษาไทยพร้อมแสดงให้ผู้ใช้) */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // เน็ตหลุด, เซิร์ฟเวอร์ไม่ตอบ, หรือหมดเวลา
    throw new ApiRequestError(0, "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่");
  } finally {
    clearTimeout(timer);
  }

  const body = (await response.json().catch(() => null)) as ({ error?: string } & T) | null;
  if (!response.ok) {
    const message =
      typeof body?.error === "string" ? body.error : "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง";
    throw new ApiRequestError(response.status, message);
  }
  if (body === null) {
    throw new ApiRequestError(response.status, "ข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง");
  }
  return body;
}

/** บอกแท็บอื่นในเครื่องนี้ว่าออเดอร์เปลี่ยน (เครื่องอื่นจะเห็นผ่านการโพลทุก ~4 วินาที) */
function pingOrdersChanged(): void {
  writeJSON(KEYS.ordersPing, Date.now());
}

// ---------- เมนู ----------

export async function getMenu(): Promise<{ categories: Category[]; foods: Food[] }> {
  return apiFetch("/api/menu");
}

// ---------- ออเดอร์ ----------

export async function createOrder(customerName: string, cartItems: CartItem[]): Promise<Order> {
  // ส่งแค่ foodId + quantity — ราคาและยอดรวมคำนวณที่ server จากฐานข้อมูล
  const { order } = await apiFetch<{ order: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customerName,
      items: cartItems.map(({ foodId, quantity }) => ({ foodId, quantity })),
    }),
  });

  // จำเลขล่าสุดของเครื่องนี้ไว้ให้กดดูในหน้าติดตามได้
  const recent = readJSON<string[]>(KEYS.recent, []).filter((n) => n !== order.orderNumber);
  writeJSON(KEYS.recent, [order.orderNumber, ...recent].slice(0, MAX_RECENT));
  pingOrdersChanged();
  return order;
}

/** ไม่พบ → null (ชื่อลูกค้าที่ได้จะถูกปิดบังบางส่วน เพราะเป็นหน้าสาธารณะ) */
export async function getOrder(orderNumber: string): Promise<Order | null> {
  const no = normalizeOrderNumber(orderNumber);
  try {
    const { order } = await apiFetch<{ order: Order }>(`/api/orders/${encodeURIComponent(no)}`);
    return order;
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

/** รายการออเดอร์สำหรับหน้าร้าน (ใหม่สุดก่อน) */
export async function listOrders(): Promise<Order[]> {
  const { orders } = await apiFetch<{ orders: Order[] }>("/api/orders");
  return orders;
}

/**
 * เลื่อนสถานะออเดอร์ไปขั้นถัดไป 1 ขั้น
 * ส่ง "สถานะถัดไป" ที่ UI คาดไว้ ให้ server ตรวจซ้ำตามกฎ (ผิดลำดับ/มีคนเปลี่ยนก่อน → 409 พร้อมข้อความไทย)
 */
export async function advanceOrder(orderNumber: string, currentStatus: OrderStatus): Promise<Order> {
  const next = nextStatus(currentStatus);
  if (!next) {
    throw new ApiRequestError(409, `ออเดอร์ ${orderNumber} ${STATUS_LABEL[currentStatus]}แล้ว เปลี่ยนสถานะต่อไม่ได้`);
  }
  const { order } = await apiFetch<{ order: Order }>(
    `/api/orders/${encodeURIComponent(orderNumber)}/status`,
    { method: "PATCH", body: JSON.stringify({ status: next }) },
  );
  pingOrdersChanged();
  return order;
}

/** ฟังว่าข้อมูลออเดอร์เปลี่ยน (จากแท็บอื่นในเครื่องเดียวกัน) */
export function subscribeOrders(callback: () => void): () => void {
  return subscribeKey(KEYS.ordersPing, callback);
}

export async function getRecentOrderNumbers(): Promise<string[]> {
  return readJSON<string[]>(KEYS.recent, []);
}

// ---------- ตะกร้า (เก็บในเครื่องลูกค้า) ----------
// หน้าเว็บอ่านตะกร้าผ่าน useCart() (lib/use-client-store.ts) ซึ่งใช้ useSyncExternalStore
// ฝั่ง server จะเห็นตะกร้าว่างเสมอ (EMPTY_CART) จึงไม่เกิด hydration error

export const EMPTY_CART: CartItem[] = [];

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return EMPTY_CART;
    // ตรวจแค่รูปแบบข้อมูล — เมนูที่ไม่มีแล้วจะถูกตัดออกตอนจับคู่กับเมนูจาก API และ server ตรวจซ้ำอีกชั้น
    return parsed.filter(
      (item) =>
        typeof item?.foodId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= MAX_QUANTITY,
    );
  } catch {
    return EMPTY_CART;
  }
}

// จำผลลัพธ์ล่าสุดไว้ เพราะ useSyncExternalStore ต้องได้ object ตัวเดิมถ้าข้อมูลไม่เปลี่ยน
let cartCache: { raw: string | null; value: CartItem[] } | null = null;

export function loadCart(): CartItem[] {
  const raw = readRaw(KEYS.cart);
  if (cartCache && cartCache.raw === raw) return cartCache.value;
  const value = parseCart(raw);
  cartCache = { raw, value };
  return value;
}

export function saveCart(cart: CartItem[]): void {
  writeJSON(KEYS.cart, cart);
}

/** ตั้งจำนวนของเมนูในตะกร้า (0 = ลบออก) */
export function setCartQuantity(foodId: string, quantity: number): void {
  const clamped = Math.min(Math.max(Math.floor(quantity), 0), MAX_QUANTITY);
  const cart = loadCart();
  const exists = cart.some((item) => item.foodId === foodId);
  const next =
    clamped === 0
      ? cart.filter((item) => item.foodId !== foodId)
      : exists
        ? cart.map((item) => (item.foodId === foodId ? { ...item, quantity: clamped } : item))
        : [...cart, { foodId, quantity: clamped }];
  saveCart(next);
}

export function clearCart(): void {
  writeJSON<CartItem[]>(KEYS.cart, []);
}

export function subscribeCart(callback: () => void): () => void {
  return subscribeKey(KEYS.cart, callback);
}

// ---------- ค่าที่ร้านค้าเลือกไว้ (มุมมอง Kanban / การ์ด) ----------

export function getVendorView(): VendorView {
  return readRaw(KEYS.vendorView) === JSON.stringify("cards") ? "cards" : "kanban";
}

export function setVendorView(view: VendorView): void {
  writeJSON(KEYS.vendorView, view);
}

export function subscribeVendorView(callback: () => void): () => void {
  return subscribeKey(KEYS.vendorView, callback);
}
