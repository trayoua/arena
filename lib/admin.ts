import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/security";

export async function requireAdmin() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get("decucare_admin")?.value)) {
    redirect("/admin/login");
  }
}
