"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, UtensilsCrossed } from "lucide-react";
import CartPanel, { type CartLine, type CartPanelProps } from "@/components/CartPanel";
import CartSheet from "@/components/CartSheet";
import CategoryChips, { type CategoryFilter } from "@/components/CategoryChips";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import FoodCard from "@/components/FoodCard";
import { LoadingRegion, Skeleton } from "@/components/Skeleton";
import {
  clearCart,
  createOrder,
  getMenu,
  setCartQuantity,
  validateCustomerName,
} from "@/lib/order-service";
import { btnOutline } from "@/lib/ui";
import { useCart } from "@/lib/use-client-store";
import type { Category, Food } from "@/lib/types";

type Menu = { categories: Category[]; foods: Food[] };

const GRID = "grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]";

export default function MenuClient({ intro }: { intro: React.ReactNode }) {
  const router = useRouter();
  const panelTitleId = useId();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  // ตะกร้าอ่านผ่าน useSyncExternalStore (ไม่หายเมื่อรีเฟรช และไม่เกิด hydration error)
  const cart = useCart();

  const [customerName, setCustomerName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // กันกดยืนยันซ้ำระหว่างรอผล (state อาจยังไม่อัปเดตทันในคลิกที่สอง)
  const submittingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    getMenu()
      .then((data) => {
        if (alive) setMenu(data);
      })
      .catch(() => {
        if (alive) setMenuError("โหลดเมนูไม่สำเร็จ กรุณาลองใหม่");
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const lines: CartLine[] = useMemo(() => {
    if (!menu) return [];
    return cart.flatMap((item) => {
      const food = menu.foods.find((f) => f.id === item.foodId);
      return food ? [{ food, quantity: item.quantity }] : [];
    });
  }, [cart, menu]);

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  // ยอดรวมนี้ใช้แสดงผลเท่านั้น ยอดจริงคำนวณใหม่ใน createOrder จากราคาในเมนู
  const total = lines.reduce((sum, line) => sum + line.food.price * line.quantity, 0);

  const nameValidation = validateCustomerName(customerName);
  const canSubmit = lines.length > 0 && nameValidation === null;

  const quantityOf = (foodId: string) => cart.find((item) => item.foodId === foodId)?.quantity ?? 0;

  async function handleSubmit() {
    setNameTouched(true);
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder(
        customerName,
        lines.map((line) => ({ foodId: line.food.id, quantity: line.quantity })),
      );
      clearCart();
      router.push(`/track?no=${encodeURIComponent(order.orderNumber)}`);
      // ไม่ปลด submitting เพื่อกันกดซ้ำระหว่างเปลี่ยนหน้า
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "ส่งออเดอร์ไม่สำเร็จ กรุณาลองใหม่");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const cartProps: CartPanelProps = {
    lines,
    loading: !menu && !menuError,
    itemCount,
    total,
    customerName,
    nameError: nameTouched ? nameValidation : null,
    submitError,
    submitting,
    canSubmit,
    onNameChange: (value) => {
      setCustomerName(value);
      setSubmitError(null);
    },
    // แสดง error ของช่องชื่อหลังผู้ใช้ออกจากช่องแล้ว (ไม่ขึ้นแดงตั้งแต่ยังไม่พิมพ์)
    onNameBlur: () => setNameTouched(true),
    onQuantityChange: setCartQuantity,
    onSubmit: handleSubmit,
  };

  const visibleFoods = menu
    ? menu.foods.filter((food) => filter === "all" || food.categoryId === filter)
    : [];

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <section className="min-w-0 flex-1" aria-label="เมนูอาหาร">
        {intro}

        {menuError ? (
          <div className="mt-6 flex flex-col items-start gap-3">
            <ErrorMessage boxed>{menuError}</ErrorMessage>
            <button
              type="button"
              className={`${btnOutline} h-12`}
              onClick={() => {
                setMenuError(null);
                setReloadKey((k) => k + 1);
              }}
            >
              <RefreshCw className="size-5" aria-hidden="true" />
              ลองอีกครั้ง
            </button>
          </div>
        ) : !menu ? (
          <LoadingRegion label="กำลังโหลดเมนู…" className="mt-6 flex flex-col gap-6">
            <div className="flex gap-2 overflow-hidden">
              {["w-24", "w-40", "w-32", "w-32", "w-28"].map((width, i) => (
                <Skeleton key={i} className={`h-12 shrink-0 rounded-full ${width}`} />
              ))}
            </div>
            <div className={GRID}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="rounded-card bg-white p-3 shadow-card">
                  <Skeleton className="aspect-[4/3]" />
                  <Skeleton className="mt-3 h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-4 h-12" />
                </div>
              ))}
            </div>
          </LoadingRegion>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <CategoryChips categories={menu.categories} selected={filter} onSelect={setFilter} />
            {visibleFoods.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="ยังไม่มีเมนูในหมวดนี้"
                description="ลองเลือกหมวดอื่น หรือกด “ทั้งหมด”"
              />
            ) : (
              <div className={GRID}>
                {visibleFoods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    quantity={quantityOf(food.id)}
                    onQuantityChange={(q) => setCartQuantity(food.id, q)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* จอกว้าง: แผงตะกร้าด้านขวา ติดหน้าจอเมื่อเลื่อน */}
      <aside
        aria-labelledby={panelTitleId}
        className="hidden w-[380px] shrink-0 rounded-panel border border-line bg-white p-6 shadow-panel lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-48px)] lg:overflow-y-auto xl:w-[400px]"
      >
        <CartPanel {...cartProps} variant="panel" titleId={panelTitleId} />
      </aside>

      {/* มือถือ: แถบล่าง + bottom sheet */}
      <CartSheet {...cartProps} />
    </div>
  );
}
