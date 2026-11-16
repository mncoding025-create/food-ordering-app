// คลาสปุ่มที่ใช้ซ้ำทั้งเว็บ (ตามดีไซน์: ปุ่มส้มใช้ตัวอักษรสี ink ไม่ใช่สีขาว)
// ความสูงกำหนดที่จุดใช้งาน (h-12 = 48px, h-[52px], h-14 = 56px)

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-bold transition-colors select-none disabled:cursor-not-allowed";

export const btnPrimary = `${base} bg-brand px-5 text-ink hover:bg-[#ea580c] disabled:bg-brand-soft disabled:hover:bg-brand-soft`;

export const btnOutline = `${base} border-2 border-edge bg-white px-4 text-ink hover:bg-sand`;

export const btnOutlineInk = `${base} border-2 border-ink bg-white px-5 text-ink hover:bg-sand`;

export const pill =
  "inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 text-[15px] font-semibold text-muted";
