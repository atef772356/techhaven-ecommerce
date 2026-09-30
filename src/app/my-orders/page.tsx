"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Fragment } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoggedIn(false);
        setOrders([]);
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(error ? [] : data ?? []);
    })();
  }, [supabase]);

  if (!orders) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your orders</h1>
            <p className="text-muted-foreground mb-6">Track your order history and shipping status.</p>
            <Button asChild><Link href="/login">Sign in</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-8">Track your order history and shipping status.</p>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders yet.</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  When you place an order, it will appear here.
                </p>
                <Button asChild><Link href="/products">Start shopping</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-0">
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      {expanded === o.id ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold">#{o.id}</span>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] || "bg-muted"}`}>
                            {o.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {o.items.length} {o.items.length === 1 ? "item" : "items"} · {o.customer_name}
                        </p>
                      </div>
                      <span className="font-bold text-lg">{formatCurrency(Number(o.total))}</span>
                    </div>
                    {expanded === o.id && (
                      <div className="border-t px-4 py-4 bg-muted/20">
                        <div className="space-y-2 mb-4">
                          <p className="font-medium text-sm mb-2">Items ordered:</p>
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity} × {item.name}</span>
                              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3 text-sm text-muted-foreground space-y-1">
                          <p>Shipping to: {o.address}, {o.city} {o.zip}</p>
                          <p>Email: {o.email}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
