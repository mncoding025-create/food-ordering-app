// ฟังก์ชันจัดรูปแบบตัวเลข/เวลา
// formatTime / formatThaiDate ใช้ timezone และ locale ของเบราว์เซอร์
// จึงต้องเรียกหลังโหลดข้อมูลฝั่ง client แล้วเท่านั้น (กัน hydration error)

export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("th-TH")}`;
}

/** "14:05 น." */
export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${time} น.`;
}

/** "16 พ.ย. 2569" */
export function formatThaiDate(value: Date): string {
  return value.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}
