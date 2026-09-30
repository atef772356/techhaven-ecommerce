"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersClient } from "./orders-client";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setOrders(error ? [] : data ?? []);
      });
  }, [supabase]);

  if (!orders) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <OrdersClient initialOrders={orders} />
    </AdminShell>
  );
}
