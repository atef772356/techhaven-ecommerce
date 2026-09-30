"use client";

import { useState, Fragment } from "react";
import { ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import type { Order } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">View and manage customer orders.</p>
      </div>

      {initialOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Orders placed in the storefront will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium w-8"></th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initialOrders.map((o) => (
                    <Fragment key={o.id}>
                      <tr
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      >
                        <td className="px-4 py-3">
                          {expanded === o.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </td>
                        <td className="px-4 py-3 font-medium">#{o.id}</td>
                        <td className="px-4 py-3">{o.customer_name}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(Number(o.total))}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] || "bg-muted"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                      {expanded === o.id && (
                        <tr className="bg-muted/20">
                          <td colSpan={6} className="px-12 py-4">
                            <div className="space-y-2">
                              <p className="font-medium text-sm mb-2">Items ordered:</p>
                              {o.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{item.quantity} × {item.name}</span>
                                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                              <div className="border-t pt-2 mt-2 text-sm text-muted-foreground">
                                <p>Shipping to: {o.address}, {o.city} {o.zip}</p>
                                <p>Email: {o.email}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
