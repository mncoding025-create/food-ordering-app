import "dotenv/config";
import { defineConfig } from "prisma/config";

// ไฟล์ตั้งค่าของ Prisma CLI
// ประกอบ URL ฐานข้อมูลจากตัวแปรแยกใน .env (DATABASE_HOST, DATABASE_PORT,
// DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME และ DATABASE_SSL ถ้ามี)
// ถ้าตัวแปรไม่ครบจะไม่ใส่ url เลย เพื่อให้ `prisma generate` รันได้แม้ไม่มี .env (เช่นตอน npm install)
function buildDatabaseUrl(): string | undefined {
  const { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_SSL } =
    process.env;

  if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_NAME) {
    return undefined;
  }

  const user = encodeURIComponent(DATABASE_USER);
  const password = encodeURIComponent(DATABASE_PASSWORD ?? "");
  const port = DATABASE_PORT || "3306";
  const ssl = DATABASE_SSL === "true" ? "?sslaccept=strict" : "";

  return `mysql://${user}:${password}@${DATABASE_HOST}:${port}/${DATABASE_NAME}${ssl}`;
}

const url = buildDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(url ? { datasource: { url } } : {}),
});
