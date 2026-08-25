import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  redirect((await isAdminAuthenticated()) ? "/admin/orders" : "/admin/login");
}
