// ตัวเชื่อมต่อฐานข้อมูล (Prisma + MariaDB) — ใช้ฝั่ง server เท่านั้น
// ค่าเชื่อมต่ออ่านจาก environment variables:
//   DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
//   DATABASE_SSL=true เพื่อเปิด SSL (ค่าเริ่มต้นปิด)
// (ตอน dev อยู่ในไฟล์ .env, ตอน deploy ตั้งใน Vercel → Project Settings → Environment Variables)
import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/** env ไม่ครบ → API ตอบ 503 แทนที่จะพังทั้งระบบ */
export class DbConfigError extends Error {
  constructor() {
    super("Database environment variables are missing");
    this.name = "DbConfigError";
  }
}

function createClient() {
  const { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_SSL } =
    process.env;
  if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_NAME) {
    throw new DbConfigError();
  }

  const adapter = new PrismaMariaDb({
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT || 3306),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    ssl: DATABASE_SSL === "true",

    // ===== ตั้งค่า connection pool =====
    // ฐานข้อมูลเป็นเซิร์ฟเวอร์กลางที่ใช้ร่วมกับเพื่อนหลายคน และบน Vercel อาจมีหลาย instance
    // แต่ละ instance มี pool ของตัวเอง → จำกัดให้เล็กไว้ (จำนวนรวม = 2 × จำนวน instance)
    connectionLimit: 2,
    // ปล่อย connection ที่ว่างเกิน 60 วินาที ต้องน้อยกว่า @@wait_timeout ของเซิร์ฟเวอร์
    // (ถ้าเซิร์ฟเวอร์ตัด connection ที่ว่างนานก่อนเรา จะเจอ "server has gone away")
    idleTimeout: 60,
    // ถ้า connection ว่างเกิน 500ms ให้ ping ตรวจก่อนหยิบไปใช้ — ตัวที่ตายแล้วจะถูกทิ้งและสร้างใหม่
    minDelayValidation: 500,
    // ไม่ตั้ง minimumIdle → ไม่ถือ connection ค้างไว้บนเซิร์ฟเวอร์กลางเมื่อไม่มีคนใช้
    connectTimeout: 5000,
    acquireTimeout: 8000,
  });

  return new PrismaClient({ adapter });
}

// เก็บ client ไว้ที่ globalThis ให้มีตัวเดียวต่อ process
// (ตอน dev กัน hot reload สร้าง client ซ้ำ, ตอน production ใช้ตัวเดิมข้ามหลาย request ใน instance เดียวกัน)
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

/**
 * คืน PrismaClient ตัวเดียวของ process — สร้างครั้งแรกเมื่อถูกเรียก (lazy)
 * จึงไม่มีการเชื่อมต่อฐานข้อมูลตอน build หรือตอน import ไฟล์
 */
export function getPrisma() {
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}
