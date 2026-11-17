// ⚠️ ไฟล์นี้เป็น "ต้นทางของข้อมูล seed" เท่านั้น — แอปไม่ได้อ่านไฟล์นี้ตอนทำงานแล้ว
//    แอปอ่านเมนูจากฐานข้อมูลผ่าน GET /api/menu (ตาราง category_026_tb, food_026_tb)
//    เก็บไว้เพื่อใช้สร้าง/ตรวจ db/seed_026.sql ถ้าแก้เมนู ให้แก้ทั้งที่นี่และใน seed ให้ตรงกัน
// รูปเมนูอยู่ที่ public/images/ แล้วอ้างด้วย imageUrl: "/images/ชื่อไฟล์.svg" (หรือ .jpg)
// ถ้าไม่มี imageUrl หรือโหลดรูปไม่ได้ การ์ดจะแสดงไอคอนหมวดแทน
import type { Category, Food } from "./types";

export const categories: Category[] = [
  { id: "rice", name: "อาหารจานเดียว" },
  { id: "noodle", name: "ก๋วยเตี๋ยว" },
  { id: "drink", name: "เครื่องดื่ม" },
  { id: "dessert", name: "ของหวาน" },
];

export const foods: Food[] = [
  {
    id: "F001",
    categoryId: "rice",
    name: "ข้าวกะเพราหมูสับไข่ดาว",
    description: "กะเพราหมูสับผัดพริกกระเทียม หอมใบกะเพรา เสิร์ฟพร้อมไข่ดาวกรอบ",
    price: 60,
    imageEmoji: "🍛",
    imageUrl: "/images/kra-pao-moo-sub-khai-dao.svg",
  },
  {
    id: "F002",
    categoryId: "rice",
    name: "ข้าวผัดกุ้ง",
    description: "ข้าวผัดไฟแรงกับกุ้งสด ไข่ และต้นหอม เสิร์ฟพร้อมมะนาว",
    price: 70,
    imageEmoji: "🍤",
    imageUrl: "/images/khao-pad-goong.svg",
  },
  {
    id: "F003",
    categoryId: "rice",
    name: "ข้าวมันไก่",
    description: "ไก่ต้มนุ่ม ข้าวมันหอม พร้อมน้ำจิ้มเต้าเจี้ยวและซุปฟัก",
    price: 55,
    imageEmoji: "🍗",
    imageUrl: "/images/khao-man-gai.svg",
  },
  {
    id: "F004",
    categoryId: "noodle",
    name: "ก๋วยเตี๋ยวเรือหมู",
    description: "น้ำซุปเข้มข้นสูตรเรือ เส้นเล็ก หมูเปื่อย ลูกชิ้น และผักบุ้ง",
    price: 50,
    imageEmoji: "🍜",
    imageUrl: "/images/kuay-teow-ruea-moo.svg",
  },
  {
    id: "F005",
    categoryId: "noodle",
    name: "ผัดไทยกุ้งสด",
    description: "เส้นจันท์ผัดซอสมะขาม กุ้งสด เต้าหู้ ถั่วงอก และถั่วลิสง",
    price: 70,
    imageEmoji: "🍝",
    imageUrl: "/images/pad-thai-goong-sod.svg",
  },
  {
    id: "F006",
    categoryId: "noodle",
    name: "ราดหน้าเส้นใหญ่หมู",
    description: "เส้นใหญ่ผัดซีอิ๊ว ราดน้ำผักคะน้าข้นหอม พร้อมหมูนุ่ม",
    price: 60,
    imageEmoji: "🥢",
    imageUrl: "/images/rad-na-sen-yai-moo.svg",
  },
  {
    id: "F007",
    categoryId: "drink",
    name: "ชาไทยเย็น",
    description: "ชาไทยชงเข้ม หวานมัน ใส่นมสดและน้ำแข็ง",
    price: 35,
    imageEmoji: "🧋",
    imageUrl: "/images/cha-thai-yen.svg",
  },
  {
    id: "F008",
    categoryId: "drink",
    name: "กาแฟเย็น",
    description: "กาแฟโรบัสต้าคั่วเข้ม ผสมนมข้น หอมกลมกล่อม",
    price: 40,
    imageEmoji: "☕",
    imageUrl: "/images/ka-fae-yen.svg",
  },
  {
    id: "F009",
    categoryId: "drink",
    name: "น้ำมะพร้าวปั่น",
    description: "มะพร้าวน้ำหอมปั่นเนื้อละเอียด สดชื่น หวานธรรมชาติ",
    price: 45,
    imageEmoji: "🥥",
    imageUrl: "/images/nam-ma-prao-pun.svg",
  },
  {
    id: "F010",
    categoryId: "dessert",
    name: "ข้าวเหนียวมะม่วง",
    description: "มะม่วงน้ำดอกไม้สุกหวาน ข้าวเหนียวมูน ราดกะทิสด",
    price: 80,
    imageEmoji: "🥭",
    imageUrl: "/images/khao-niao-ma-muang.svg",
  },
  {
    id: "F011",
    categoryId: "dessert",
    name: "บัวลอยไข่หวาน",
    description: "บัวลอยแป้งนุ่มในน้ำกะทิอุ่นๆ พร้อมไข่หวาน",
    price: 40,
    imageEmoji: "🍡",
    imageUrl: "/images/bua-loy-khai-wan.svg",
  },
  {
    id: "F012",
    categoryId: "dessert",
    name: "ไอศกรีมกะทิ",
    description: "ไอศกรีมกะทิสด โรยถั่วลิสงคั่ว และข้าวเหนียว",
    price: 35,
    imageEmoji: "🍨",
    imageUrl: "/images/i-tim-ka-ti.svg",
  },
];
