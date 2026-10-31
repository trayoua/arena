import "server-only";
import { product as fallbackProduct, type ProductInfo } from "@/lib/content";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function getPublicProduct(id = "decucare-150"): Promise<ProductInfo> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("id,name,volume,description,price_cents,currency,image_path")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return fallbackProduct;
    return {
      id: data.id,
      name: data.name,
      volume: data.volume,
      description: data.description || fallbackProduct.description,
      price: data.price_cents === null ? null : data.price_cents / 100,
      currency: data.currency,
      image: data.image_path || fallbackProduct.image,
    };
  } catch {
    return fallbackProduct;
  }
}
