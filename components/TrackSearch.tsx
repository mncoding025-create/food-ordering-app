"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import ErrorMessage from "./ErrorMessage";
import { normalizeOrderNumber } from "@/lib/order-service";
import { btnPrimary } from "@/lib/ui";

// การ์ดค้นหาเลขออเดอร์ (รับได้ทั้ง "7", "fo7", "FO-0007")
export default function TrackSearch({
  defaultValue = "",
  invalid = false,
  inputRef,
}: {
  defaultValue?: string;
  /** true เมื่อค้นแล้วไม่พบ → ช่องเป็นสีแดง */
  invalid?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState(defaultValue);
  const [emptyError, setEmptyError] = useState(false);

  return (
    <form
      role="search"
      noValidate
      className="rounded-card border border-line bg-white px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim() === "") {
          setEmptyError(true);
          return;
        }
        router.push(`/track?no=${encodeURIComponent(normalizeOrderNumber(value))}`);
      }}
    >
      <label htmlFor={inputId} className="mb-1.5 block text-[16px] font-bold">
        ค้นหาเลขออเดอร์
      </label>
      <div className="flex gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="เช่น FO-0001"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setEmptyError(false);
          }}
          aria-invalid={invalid || emptyError ? true : undefined}
          aria-describedby={emptyError ? errorId : undefined}
          className={`h-[52px] min-w-0 flex-1 rounded-btn border-2 px-4 text-[20px] font-bold uppercase placeholder:font-normal placeholder:normal-case placeholder:text-input-border ${
            invalid || emptyError ? "border-danger-bd bg-danger-bg" : "border-input-border bg-white"
          }`}
        />
        <button type="submit" className={`${btnPrimary} h-[52px] shrink-0`}>
          <Search className="size-5" aria-hidden="true" />
          ค้นหา
        </button>
      </div>
      {emptyError && <ErrorMessage id={errorId}>กรุณากรอกเลขออเดอร์</ErrorMessage>}
    </form>
  );
}
