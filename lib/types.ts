// ชนิดข้อมูลหลักของระบบ ใช้ร่วมกันทั้งฝั่งลูกค้าและฝั่งร้านค้า
// โครงนี้ตั้งใจให้ตรงกับตารางในฐานข้อมูลที่จะทำในเฟสถัดไป

export type CategoryId = "rice" | "noodle" | "drink" | "dessert";

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Food {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  price: number;
  /** ใช้ตอนทำ seed เท่านั้น ไม่แสดงใน UI (UI ใช้ไอคอนหมวดแทน) */
  imageEmoji: string;
  /** path รูปจริง เช่น "/images/kaprao.jpg" (วางไฟล์ไว้ใน public/images/) ถ้าไม่มีจะแสดงไอคอนหมวด */
  imageUrl?: string;
}

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED";

export interface OrderItem {
  foodId: string;
  foodName: string;
  /** ราคาต่อหน่วย ณ เวลาที่สั่ง (คัดลอกจากเมนู) */
  price: number;
  quantity: number;
}

export interface Order {
  /** รูปแบบ FO-0001 เรียงต่อเนื่อง */
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  /** เวลาที่สั่ง (ISO string) */
  createdAt: string;
}

/** ของในตะกร้า เก็บแค่ id กับจำนวน ราคาดึงจากเมนูเสมอ */
export interface CartItem {
  foodId: string;
  quantity: number;
}

export type VendorView = "kanban" | "cards";
