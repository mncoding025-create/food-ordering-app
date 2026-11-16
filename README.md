# Food Ordering App

เว็บแอปสั่งอาหาร (Mini Project วิชา Next.js) — Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma 7 + MySQL (ผ่าน `@prisma/adapter-mariadb`)

## เริ่มต้นใช้งาน

1. ติดตั้งแพ็กเกจ (จะรัน `prisma generate` ให้อัตโนมัติ)
   ```bash
   npm install
   ```
2. คัดลอกไฟล์ตัวอย่างค่าตั้งค่า แล้วกรอกค่าจริงเองในไฟล์ `.env`
   ```bash
   cp .env.example .env
   ```
   ตัวแปรที่ต้องกรอก: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
   และ `DATABASE_SSL` (ใส่ `true` ถ้าเซิร์ฟเวอร์ต้องใช้ SSL ค่าเริ่มต้น `false`)
3. รันโหมดพัฒนา
   ```bash
   npm run dev
   ```

> ไฟล์ `.env` ถูก ignore ใน git แล้ว — ห้าม commit และห้ามใส่ host หรือรหัสผ่านจริงในโค้ด/README

## ⚠️ ข้อห้ามเรื่องฐานข้อมูล

ฐานข้อมูล MySQL เป็นของอาจารย์และ **ใช้ร่วมกันทั้งห้อง** ห้ามรันคำสั่งที่แก้โครงสร้างหรือข้อมูลของฐานข้อมูล:

- ❌ `npx prisma migrate dev` / `migrate deploy` / `migrate reset`
- ❌ `npx prisma db push`
- ❌ `npx prisma db pull` (จะเขียนทับ `schema.prisma`)

คำสั่งที่ใช้ได้: ✅ `npx prisma generate` (สร้าง Prisma Client ลงโฟลเดอร์ `generated/` ไม่ได้ต่อฐานข้อมูล)
