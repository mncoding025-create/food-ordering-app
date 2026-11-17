-- =====================================================================
-- Food Ordering App — ข้อมูลตั้งต้น (ชุด 026)
-- สร้างจาก lib/menu-data.ts (หมวด 4 รายการ, เมนู 12 รายการ) — ค่าต้องตรงกับไฟล์นั้นเสมอ
--
-- * รันหลัง db/schema_026.sql
-- * ใช้ INSERT ... ON DUPLICATE KEY UPDATE → รันซ้ำได้ (อัปเดตค่าให้ตรง) ไม่มีการลบข้อมูล
-- * แตะเฉพาะ category_026_tb และ food_026_tb ไม่ใส่ออเดอร์ตัวอย่าง
--
-- วิธีรัน (ผู้ใช้รันเอง):
--   mysql --default-character-set=utf8mb4 -h <host> -u <user> -p <database> < db/seed_026.sql
-- =====================================================================

SET NAMES utf8mb4;

START TRANSACTION;

-- หมวดหมู่ (sort_order ตามลำดับใน menu-data)
INSERT INTO category_026_tb (id, name, sort_order) VALUES
  ('rice', 'อาหารจานเดียว', 1),
  ('noodle', 'ก๋วยเตี๋ยว', 2),
  ('drink', 'เครื่องดื่ม', 3),
  ('dessert', 'ของหวาน', 4)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order);

-- เมนูอาหาร (ราคาเป็นบาท, is_available = 1 ทุกเมนู)
INSERT INTO food_026_tb
  (id, category_id, name, description, price, image_url, image_emoji, is_available, sort_order)
VALUES
  ('F001', 'rice', 'ข้าวกะเพราหมูสับไข่ดาว',
   'กะเพราหมูสับผัดพริกกระเทียม หอมใบกะเพรา เสิร์ฟพร้อมไข่ดาวกรอบ',
   60.00, '/images/kra-pao-moo-sub-khai-dao.svg', '🍛', 1, 1),
  ('F002', 'rice', 'ข้าวผัดกุ้ง',
   'ข้าวผัดไฟแรงกับกุ้งสด ไข่ และต้นหอม เสิร์ฟพร้อมมะนาว',
   70.00, '/images/khao-pad-goong.svg', '🍤', 1, 2),
  ('F003', 'rice', 'ข้าวมันไก่',
   'ไก่ต้มนุ่ม ข้าวมันหอม พร้อมน้ำจิ้มเต้าเจี้ยวและซุปฟัก',
   55.00, '/images/khao-man-gai.svg', '🍗', 1, 3),
  ('F004', 'noodle', 'ก๋วยเตี๋ยวเรือหมู',
   'น้ำซุปเข้มข้นสูตรเรือ เส้นเล็ก หมูเปื่อย ลูกชิ้น และผักบุ้ง',
   50.00, '/images/kuay-teow-ruea-moo.svg', '🍜', 1, 4),
  ('F005', 'noodle', 'ผัดไทยกุ้งสด',
   'เส้นจันท์ผัดซอสมะขาม กุ้งสด เต้าหู้ ถั่วงอก และถั่วลิสง',
   70.00, '/images/pad-thai-goong-sod.svg', '🍝', 1, 5),
  ('F006', 'noodle', 'ราดหน้าเส้นใหญ่หมู',
   'เส้นใหญ่ผัดซีอิ๊ว ราดน้ำผักคะน้าข้นหอม พร้อมหมูนุ่ม',
   60.00, '/images/rad-na-sen-yai-moo.svg', '🥢', 1, 6),
  ('F007', 'drink', 'ชาไทยเย็น',
   'ชาไทยชงเข้ม หวานมัน ใส่นมสดและน้ำแข็ง',
   35.00, '/images/cha-thai-yen.svg', '🧋', 1, 7),
  ('F008', 'drink', 'กาแฟเย็น',
   'กาแฟโรบัสต้าคั่วเข้ม ผสมนมข้น หอมกลมกล่อม',
   40.00, '/images/ka-fae-yen.svg', '☕', 1, 8),
  ('F009', 'drink', 'น้ำมะพร้าวปั่น',
   'มะพร้าวน้ำหอมปั่นเนื้อละเอียด สดชื่น หวานธรรมชาติ',
   45.00, '/images/nam-ma-prao-pun.svg', '🥥', 1, 9),
  ('F010', 'dessert', 'ข้าวเหนียวมะม่วง',
   'มะม่วงน้ำดอกไม้สุกหวาน ข้าวเหนียวมูน ราดกะทิสด',
   80.00, '/images/khao-niao-ma-muang.svg', '🥭', 1, 10),
  ('F011', 'dessert', 'บัวลอยไข่หวาน',
   'บัวลอยแป้งนุ่มในน้ำกะทิอุ่นๆ พร้อมไข่หวาน',
   40.00, '/images/bua-loy-khai-wan.svg', '🍡', 1, 11),
  ('F012', 'dessert', 'ไอศกรีมกะทิ',
   'ไอศกรีมกะทิสด โรยถั่วลิสงคั่ว และข้าวเหนียว',
   35.00, '/images/i-tim-ka-ti.svg', '🍨', 1, 12)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  image_url = VALUES(image_url),
  image_emoji = VALUES(image_emoji),
  sort_order = VALUES(sort_order);

COMMIT;

-- ตรวจผล (อ่านอย่างเดียว): ควรได้ category = 4, food = 12
SELECT 'category_026_tb' AS table_name, COUNT(*) AS total FROM category_026_tb
UNION ALL
SELECT 'food_026_tb', COUNT(*) FROM food_026_tb;
