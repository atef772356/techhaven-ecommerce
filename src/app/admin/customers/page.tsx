"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { User, Order } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Mail, Crown, User as UserIcon, Loader2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [orderStats, setOrderStats] = useState<Map<string, { count: number; total: number }>>(new Map());
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      const [{ data: usersData }, { data: ordersData }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*"),
      ]);
      const orders = ordersData ?? [];
      const stats = new Map<string, { count: number; total: number }>();
      for (const o of orders) {
        const cur = stats.get(o.email) ?? { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number(o.total);
        stats.set(o.email, cur);
      }
      setUsers(usersData ?? []);
      setOrderStats(stats);
    })();
  }, [supabase]);

  if (!users) {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">View registered customers and their activity.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => {
            const stats = orderStats.get(u.email) ?? { count: 0, total: 0 };
            return (
              <Card key={u.id}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {u.role === "ADMIN" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{u.full_name || u.email.split("@")[0]}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {u.email}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Orders</p>
                      <p className="font-bold">{stats.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-bold">{formatCurrency(stats.total)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium capitalize">
                      {u.role}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
