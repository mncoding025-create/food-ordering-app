// ตัวช่วยของ API route handlers — ใช้ฝั่ง server เท่านั้น
// หลักการ: ข้อความ error ที่ส่งให้ client เป็นภาษาไทยแบบทั่วไปเสมอ
// รายละเอียดจริง (ข้อความจากฐานข้อมูล, stack) log ไว้ฝั่ง server เท่านั้น ไม่รั่วออกไป
import "server-only";
import { DbConfigError } from "@/lib/prisma";

/** error ที่ตั้งใจส่งให้ client เห็น (ข้อความภาษาไทยปลอดภัยแล้ว) */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function apiError(status: number, message: string): Response {
  return json({ error: message }, status);
}

/** อ่าน body เป็น JSON (ถ้าไม่ใช่ JSON ที่ถูกต้อง → 400) */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "ข้อมูลที่ส่งมาไม่ถูกต้อง");
  }
}

function isConnectionProblem(error: unknown): boolean {
  if (error instanceof DbConfigError) return true;
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`;
  return /Initialization|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|gone away|pool timeout|retrieve connection|connect timeout|Connection closed|socket/i.test(
    text,
  );
}

/** ครอบ handler: แปลง error ทุกแบบให้เป็นคำตอบภาษาไทยที่ปลอดภัย */
export async function handleApi(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ApiError) {
      return apiError(error.status, error.message);
    }
    // log ฝั่ง server (ดูได้ใน terminal / Vercel logs) — ไม่ส่งรายละเอียดให้ client
    console.error("[api] unexpected error:", error);
    if (isConnectionProblem(error)) {
      return apiError(503, "เชื่อมต่อฐานข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง");
    }
    return apiError(500, "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง");
  }
}
