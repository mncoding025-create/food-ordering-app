-- =====================================================================
-- Food Ordering App — โครงสร้างตาราง (ชุด 026)
-- ฐานข้อมูล: MariaDB 11.8 (เซิร์ฟเวอร์กลาง ใช้ร่วมกับเพื่อนหลายคน)
--
-- กติกาของไฟล์นี้:
--   * ใช้เฉพาะ CREATE TABLE IF NOT EXISTS — รันซ้ำได้ ไม่ลบ/ไม่แก้ตารางที่มีอยู่แล้ว
--   * แตะเฉพาะตารางที่ลงท้าย _026_tb เท่านั้น
--   * ชื่อ constraint / index ลงท้าย _026 ทั้งหมด
--     (ชื่อ FOREIGN KEY ใน InnoDB ต้องไม่ซ้ำกันทั้งฐานข้อมูล จึงต้องมีรหัสของเรากำกับ)
--
-- วิธีรัน (ผู้ใช้รันเอง):
--   mysql --default-character-set=utf8mb4 -h <host> -u <user> -p <database> < db/schema_026.sql
--
-- ห้ามใช้ prisma migrate / prisma db push / prisma db pull กับฐานข้อมูลกลาง
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1) หมวดหมู่อาหาร  (ตรงกับ Category ใน lib/types.ts)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category_026_tb (
  id          VARCHAR(20)        NOT NULL COMMENT 'rice / noodle / drink / dessert',
  name        VARCHAR(100)       NOT NULL COMMENT 'ชื่อหมวดภาษาไทย',
  sort_order  SMALLINT UNSIGNED  NOT NULL DEFAULT 0 COMMENT 'ลำดับแสดงผล',
  created_at  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_category_026 PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='หมวดหมู่อาหาร (Food Ordering 026)';

-- ---------------------------------------------------------------------
-- 2) เมนูอาหาร  (ตรงกับ Food ใน lib/types.ts / lib/menu-data.ts)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_026_tb (
  id            VARCHAR(10)        NOT NULL COMMENT 'F001–F012',
  category_id   VARCHAR(20)        NOT NULL,
  name          VARCHAR(150)       NOT NULL,
  description   VARCHAR(500)       NOT NULL DEFAULT '',
  price         DECIMAL(10,2)      NOT NULL COMMENT 'ราคาต่อหน่วย (บาท)',
  image_url     VARCHAR(255)       NULL     COMMENT 'เช่น /images/khao-man-gai.svg',
  image_emoji   VARCHAR(16)        NULL     COMMENT 'ใช้อ้างอิงเท่านั้น ไม่แสดงใน UI',
  is_available  TINYINT(1)         NOT NULL DEFAULT 1 COMMENT '1 = พร้อมขาย, 0 = ปิดขาย (ใช้แทนการลบ)',
  sort_order    SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
  created_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_food_026 PRIMARY KEY (id),
  KEY idx_food_category_026 (category_id, is_available),
  CONSTRAINT fk_food_category_026 FOREIGN KEY (category_id)
    REFERENCES category_026_tb (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_food_price_026 CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='เมนูอาหาร (Food Ordering 026)';

-- ---------------------------------------------------------------------
-- 3) ออเดอร์  (ตรงกับ Order ใน lib/types.ts)
--    id = เลขออเดอร์ แอปแสดงเป็น "FO-" + เลข 4 หลัก (id 1 → FO-0001)
--    status ต้องตรงกับ STATUS_FLOW ใน lib/order-status.ts
--    กฎ "เปลี่ยนสถานะทีละขั้น ห้ามข้าม/ย้อน" บังคับในโค้ดฝั่ง server (ENUM กันได้แค่ค่าที่ไม่รู้จัก)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_026_tb (
  id             INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT 'เลขออเดอร์',
  customer_name  VARCHAR(50)    NOT NULL,
  status         ENUM('PENDING','PREPARING','READY','COMPLETED') NOT NULL DEFAULT 'PENDING',
  total_price    DECIMAL(10,2)  NOT NULL COMMENT 'server คำนวณจากราคาในเมนู ไม่รับค่าจาก client',
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_order_026 PRIMARY KEY (id),
  KEY idx_order_status_026 (status, created_at),
  KEY idx_order_created_026 (created_at),
  CONSTRAINT chk_order_total_026 CHECK (total_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='ออเดอร์ (Food Ordering 026)';

-- ---------------------------------------------------------------------
-- 4) รายการในออเดอร์  (ตรงกับ OrderItem ใน lib/types.ts)
--    food_name / unit_price เป็น snapshot ณ ตอนสั่ง — แก้เมนูภายหลังไม่กระทบออเดอร์เก่า
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item_026_tb (
  id          INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED       NOT NULL,
  food_id     VARCHAR(10)        NOT NULL,
  food_name   VARCHAR(150)       NOT NULL COMMENT 'ชื่อเมนู ณ ตอนสั่ง',
  unit_price  DECIMAL(10,2)      NOT NULL COMMENT 'ราคาต่อหน่วย ณ ตอนสั่ง',
  quantity    SMALLINT UNSIGNED  NOT NULL,
  line_total  DECIMAL(10,2)      NOT NULL COMMENT 'unit_price * quantity',
  CONSTRAINT pk_order_item_026 PRIMARY KEY (id),
  CONSTRAINT uq_order_item_026 UNIQUE KEY (order_id, food_id),
  KEY idx_order_item_food_026 (food_id),
  CONSTRAINT fk_order_item_order_026 FOREIGN KEY (order_id)
    REFERENCES order_026_tb (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_item_food_026 FOREIGN KEY (food_id)
    REFERENCES food_026_tb (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_order_item_qty_026 CHECK (quantity BETWEEN 1 AND 99),
  CONSTRAINT chk_order_item_total_026 CHECK (line_total = unit_price * quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='รายการอาหารในออเดอร์ (Food Ordering 026)';
