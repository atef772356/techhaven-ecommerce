"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsClient } from "./products-client";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setProducts(error ? [] : data ?? []);
      });
  }, [supabase]);

  if (!products) {
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
      <ProductsClient initialProducts={products} />
    </AdminShell>
  );
}
