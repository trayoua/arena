import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isEmailConfigured } from "@/lib/order-emails";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Поръчки | DECUCARE администрация",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const [{ data: orders, error: ordersError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id,reference,kind,product_name,product_volume,quantity,total_price_cents,currency,customer_name,customer_email,customer_phone,message,status,created_at,owner_email_status,customer_email_status,email_last_error",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("products").select("id,name,volume,price_cents,currency").order("id"),
    ]);

  if (ordersError || productsError) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <h1>Временна техническа грешка</h1>
          <p>Не успяхме да заредим данните. Опитайте отново след малко.</p>
        </div>
      </main>
    );
  }

  return (
    <AdminDashboard
      orders={orders ?? []}
      products={products ?? []}
      emailConfigured={isEmailConfigured()}
    />
  );
}
