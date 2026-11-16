"use client";

import { useId } from "react";
import { Check, LoaderCircle, ShoppingCart, Trash2 } from "lucide-react";
import ErrorMessage from "./ErrorMessage";
import QuantityStepper from "./QuantityStepper";
import { Skeleton } from "./Skeleton";
import { formatBaht } from "@/lib/format";
import { btnPrimary } from "@/lib/ui";
import type { Food } from "@/lib/types";

export interface CartLine {
  food: Food;
  quantity: number;
}

export interface CartPanelProps {
  lines: CartLine[];
  /** true ระหว่างโหลดเมนู (ยังจับคู่ของในตะกร้ากับเมนูไม่ได้) */
  loading: boolean;
  itemCount: number;
  total: number;
  customerName: string;
  /** error ของช่องชื่อ (แสดงเมื่อผู้ใช้ออกจากช่องแล้วเท่านั้น) */
  nameError: string | null;
  submitError: string | null;
  submitting: boolean;
  canSubmit: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onQuantityChange: (foodId: string, quantity: number) => void;
  onSubmit: () => void;
}

// เนื้อหาตะกร้า ใช้ร่วมกันทั้งแผงด้านขวา (จอกว้าง) และ bottom sheet (มือถือ)
export default function CartPanel({
  variant,
  titleId,
  headerAction,
  ...props
}: CartPanelProps & {
  variant: "panel" | "sheet";
  titleId: string;
  headerAction?: React.ReactNode;
}) {
  const nameId = useId();
  const nameErrorId = useId();
  const hintId = useId();
  const {
    lines,
    loading,
    itemCount,
    total,
    customerName,
    nameError,
    submitError,
    submitting,
    canSubmit,
  } = props;

  const showHint = !submitting && !canSubmit && lines.length > 0 && !nameError;

  return (
    <div className="flex flex-col gap-5">
      {/* หัวแผง */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ShoppingCart className="size-7 shrink-0" aria-hidden="true" />
        <h2
          id={titleId}
          className={`leading-tight font-extrabold ${variant === "sheet" ? "text-[22px]" : "text-[24px]"}`}
        >
          ตะกร้าของคุณ
        </h2>
        <span className="rounded-full bg-brand-tint px-3 py-1 text-[15px] font-bold whitespace-nowrap text-brand-text">
          {itemCount} รายการ
        </span>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-card border-2 border-dashed border-edge px-4 py-8 text-center">
          <ShoppingCart className="mb-1 size-12 text-input-border" aria-hidden="true" />
          <p className="text-[20px] font-bold">ตะกร้ายังว่างอยู่</p>
          <p className="text-[16px] text-muted">เลือกเมนูที่ชอบ แล้วกด “เพิ่มลงตะกร้า”</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-line">
            {lines.map(({ food, quantity }) => (
              <li key={food.id} className="flex flex-col gap-2 py-3 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[18px] leading-snug font-semibold">{food.name}</span>
                  <span className="text-[18px] font-bold whitespace-nowrap">
                    {formatBaht(food.price * quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-[150px]">
                    <QuantityStepper
                      size="md"
                      name={food.name}
                      quantity={quantity}
                      onChange={(q) => props.onQuantityChange(food.id, q)}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`ลบ ${food.name} ออกจากตะกร้า`}
                    onClick={() => props.onQuantityChange(food.id, 0)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-btn px-3 font-bold text-danger hover:bg-danger-bg"
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-between border-t-2 border-line pt-4">
            <span className="text-[20px] font-semibold">ยอดรวม</span>
            <span
              className={`font-extrabold text-brand-dark ${variant === "sheet" ? "text-[30px]" : "text-[32px]"}`}
            >
              {formatBaht(total)}
            </span>
          </div>
        </>
      )}

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit();
        }}
      >
        <div>
          <label htmlFor={nameId} className="mb-1.5 block text-[17px] font-bold">
            ชื่อลูกค้า
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="name"
            maxLength={50}
            placeholder="เช่น คุณสมชาย"
            value={customerName}
            onChange={(event) => props.onNameChange(event.target.value)}
            onBlur={props.onNameBlur}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? nameErrorId : undefined}
            className={`h-[52px] w-full rounded-btn border-2 bg-white px-4 text-[18px] placeholder:text-input-border ${
              nameError ? "border-danger-bd bg-danger-bg" : "border-input-border"
            }`}
          />
          {nameError && <ErrorMessage id={nameErrorId}>{nameError}</ErrorMessage>}
        </div>

        {submitError && <ErrorMessage boxed>{submitError}</ErrorMessage>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          aria-describedby={showHint ? hintId : undefined}
          className={`${btnPrimary} h-14 w-full text-[20px] font-extrabold ${submitting ? "disabled:cursor-wait" : ""}`}
        >
          {submitting ? (
            <>
              <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
              กำลังส่งออเดอร์…
            </>
          ) : (
            <>
              <Check className="size-6" aria-hidden="true" />
              ยืนยันสั่งอาหาร
            </>
          )}
        </button>
        {showHint && (
          <p id={hintId} className="-mt-2 text-center text-[15px] text-muted">
            กรอกชื่อลูกค้าเพื่อยืนยันออเดอร์
          </p>
        )}
      </form>
    </div>
  );
}
