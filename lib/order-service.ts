// ชั้นบริการ (service) ของออเดอร์ — หน้าต่างๆ เรียกผ่านไฟล์นี้เท่านั้น
// ตอนนี้เก็บข้อมูลจำลองใน localStorage (ผ่าน lib/storage.ts)
// เฟสถัดไป: เปลี่ยนเนื้อในฟังก์ชันที่มี TODO(API) เป็น fetch() ไปที่ API จริง
// โดยไม่ต้องแก้หน้าเว็บ เพราะทุกฟังก์ชันเป็น async อยู่แล้ว
import { categories, foods } from "./menu-data";
import { nextStatus, STATUS_META } from "./order-status";
import { readJSON, readRaw, removeKey, subscribeKey, writeJSON } from "./storage";
import type { CartItem, Category, Food, Order, OrderItem, VendorView } from "./types";

const KEYS = {
  orders: "fo:orders",
  counter: "fo:order-counter",
  recent: "fo:recent-orders",
  cart: "fo:cart",
  vendorView: "fo:vendor-view",
} as const;

const MAX_QUANTITY = 99;
const MAX_RECENT = 5;

/** หน่วงเวลาเล็กน้อยเหมือนเรียกผ่านเครือข่าย ให้เห็นสถานะ loading ตอน demo */
function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** แปลงสิ่งที่ผู้ใช้พิมพ์ เช่น "7", "fo7", "FO-0007" ให้เป็น "FO-0007" */
export function normalizeOrderNumber(input: string): string {
  const trimmed = input.trim().toUpperCase();
  const digits = trimmed.replace(/^FO-?/, "");
  if (/^\d{1,6}$/.test(digits)) {
    return `FO-${digits.padStart(4, "0")}`;
  }
  return trimmed;
}

/** ตรวจชื่อลูกค้า คืนข้อความ error ภาษาไทย หรือ null ถ้าผ่าน */
export function validateCustomerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "กรุณากรอกชื่อก่อนยืนยันออเดอร์";
  if (trimmed.length < 2) return "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร";
  if (trimmed.length > 50) return "ชื่อยาวเกินไป (ไม่เกิน 50 ตัวอักษร)";
  return null;
}

// ---------- เมนู ----------

export async function getMenu(): Promise<{ categories: Category[]; foods: Food[] }> {
  // TODO(API): return (await fetch("/api/menu")).json()
  await delay();
  return { categories, foods };
}

// ---------- ออเดอร์ ----------

function readOrders(): Order[] {
  return readJSON<Order[]>(KEYS.orders, []);
}

export async function createOrder(customerName: string, cartItems: CartItem[]): Promise<Order> {
  // TODO(API): POST /api/orders { customerName, items: [{ foodId, quantity }] }
  //            ฝั่ง server ต้องตรวจซ้ำและคำนวณยอดเองเหมือนด้านล่าง
  await delay(500);

  const nameError = validateCustomerName(customerName);
  if (nameError) throw new Error(nameError);
  if (cartItems.length === 0) throw new Error("ตะกร้ายังว่างอยู่ กรุณาเลือกเมนูก่อน");

  // คำนวณราคาจากเมนูเท่านั้น ไม่รับราคา/ยอดรวมจาก client
  const items: OrderItem[] = cartItems.map((cartItem) => {
    const food = foods.find((f) => f.id === cartItem.foodId);
    if (!food) throw new Error("มีเมนูในตะกร้าที่ไม่มีในร้านแล้ว กรุณาลบออกแล้วลองใหม่");
    const quantity = cartItem.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new Error(`จำนวนของ ${food.name} ไม่ถูกต้อง`);
    }
    return { foodId: food.id, foodName: food.name, price: food.price, quantity };
  });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // เลขออเดอร์เรียงต่อเนื่อง FO-0001, FO-0002, ... (ภายหลังใช้ auto increment ของฐานข้อมูล)
  const counter = readJSON<number>(KEYS.counter, 0) + 1;
  writeJSON(KEYS.counter, counter);

  const order: Order = {
    orderNumber: `FO-${String(counter).padStart(4, "0")}`,
    customerName: customerName.trim(),
    items,
    total,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  writeJSON(KEYS.orders, [...readOrders(), order]);

  // จำเลขล่าสุดของเครื่องนี้ไว้ให้กดดูในหน้าติดตามได้ (เก็บในเครื่องต่อไปแม้มี API)
  const recent = readJSON<string[]>(KEYS.recent, []).filter((n) => n !== order.orderNumber);
  writeJSON(KEYS.recent, [order.orderNumber, ...recent].slice(0, MAX_RECENT));

  return order;
}

export async function getOrder(orderNumber: string): Promise<Order | null> {
  // TODO(API): GET /api/orders/{orderNumber} (404 → null)
  await delay();
  const target = normalizeOrderNumber(orderNumber);
  return readOrders().find((o) => o.orderNumber === target) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  // TODO(API): GET /api/orders
  await delay();
  // ใหม่สุดก่อน
  return [...readOrders()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * เลื่อนสถานะออเดอร์ไปขั้นถัดไป 1 ขั้นเท่านั้น
 * ไม่มีฟังก์ชันตั้งสถานะตรงๆ จึงข้ามขั้นหรือย้อนกลับไม่ได้
 */
export async function advanceOrder(orderNumber: string): Promise<Order> {
  // TODO(API): POST /api/orders/{orderNumber}/advance — server เช็กกฎลำดับสถานะซ้ำ
  await delay();
  const target = normalizeOrderNumber(orderNumber);
  const orders = readOrders();
  const index = orders.findIndex((o) => o.orderNumber === target);
  if (index === -1) throw new Error(`ไม่พบออเดอร์ ${target}`);

  const current = orders[index];
  const next = nextStatus(current.status);
  if (!next) {
    throw new Error(`ออเดอร์ ${target} ${STATUS_META[current.status].label}แล้ว เปลี่ยนสถานะต่อไม่ได้`);
  }

  const updated: Order = { ...current, status: next };
  orders[index] = updated;
  writeJSON(KEYS.orders, orders);
  return updated;
}

/** ฟังว่าข้อมูลออเดอร์เปลี่ยน (เช่น อีกแท็บสั่งอาหารหรือเปลี่ยนสถานะ) */
export function subscribeOrders(callback: () => void): () => void {
  // TODO(API): เปลี่ยนเป็น Server-Sent Events/WebSocket หรือพึ่งการโพลอย่างเดียว
  return subscribeKey(KEYS.orders, callback);
}

export async function getRecentOrderNumbers(): Promise<string[]> {
  return readJSON<string[]>(KEYS.recent, []);
}

/** ล้างข้อมูลทดสอบทั้งหมด — ใช้ตอนซ้อม demo เท่านั้น (ลบออกเมื่อต่อ API จริง) */
export async function resetDemoData(): Promise<void> {
  removeKey(KEYS.counter);
  removeKey(KEYS.recent);
  removeKey(KEYS.orders);
}

// ---------- ตะกร้า (เก็บในเครื่องลูกค้า ไม่ต้องย้ายไป API) ----------
// หน้าเว็บอ่านตะกร้าผ่าน useCart() (lib/use-client-store.ts) ซึ่งใช้ useSyncExternalStore
// ฝั่ง server จะเห็นตะกร้าว่างเสมอ (EMPTY_CART) จึงไม่เกิด hydration error

export const EMPTY_CART: CartItem[] = [];

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return EMPTY_CART;
    // กรองของที่ไม่มีในเมนูแล้วหรือจำนวนผิดรูปแบบทิ้ง
    return parsed.filter(
      (item) =>
        foods.some((f) => f.id === item.foodId) &&
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

export { MAX_QUANTITY };

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
