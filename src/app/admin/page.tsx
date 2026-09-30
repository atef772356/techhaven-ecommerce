"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { OverviewClient } from "./overview-client";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order, Product } from "@/lib/db";
import { Loader2 } from "lucide-react";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesData: { date: string; sales: number; orders: number }[];
  recentOrders: { id: number; customer_name: string; total: number; status: string; created_at: string }[];
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      const [{ data: ordersData }, { data: productsData }, { data: profilesData }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
        supabase.from("profiles").select("*"),
      ]);

      const orders = ordersData ?? [];
      const products = productsData ?? [];

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const salesData = last7Days.map((d) => {
        const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === d.toDateString());
        return {
          date: d.toLocaleDateString("en-US", { weekday: "short" }),
          sales: dayOrders.reduce((s, o) => s + Number(o.total), 0),
          orders: dayOrders.length,
        };
      });

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: profilesData?.length ?? 0,
        salesData,
        recentOrders: orders.slice(0, 5),
      });
    })();
  }, [supabase]);

  if (!stats) {
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
      <OverviewClient stats={stats} />
    </AdminShell>
  );
}
