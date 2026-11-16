// จุดเดียวในโปรเจกต์ที่แตะ localStorage
// คอมโพเนนต์ห้ามเรียก localStorage ตรงๆ ให้เรียกผ่าน order-service แทน
// เมื่อเปลี่ยนไปใช้ API จริง ไฟล์นี้จะเหลือใช้แค่เก็บค่าของเครื่อง (ตะกร้า, มุมมองที่เลือก)

const LOCAL_EVENT = "fo-storage";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** อ่านค่าดิบ (string) ใช้เทียบว่าค่าเปลี่ยนหรือยัง */
export function readRaw(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  // event "storage" ของเบราว์เซอร์ยิงเฉพาะแท็บอื่น จึงยิง event เองให้แท็บนี้รู้ด้วย
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: key }));
}

export function removeKey(key: string): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: key }));
}

/** ฟังการเปลี่ยนแปลงของ key (ทั้งจากแท็บนี้และแท็บอื่น) คืนฟังก์ชันยกเลิก */
export function subscribeKey(key: string, callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    // event.key เป็น null เมื่อมีการ clear ทั้งหมด
    if (event.key === key || event.key === null) callback();
  };
  const onLocal = (event: Event) => {
    if ((event as CustomEvent<string>).detail === key) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onLocal);
  };
}
