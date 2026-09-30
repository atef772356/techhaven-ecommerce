"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/storefront/navbar";
import { Hero } from "@/components/storefront/hero";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (error) {
          setProducts([]);
        } else {
          setProducts(data ?? []);
        }
      });
  }, [supabase]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured products</h2>
              <p className="text-muted-foreground mt-1">
                Hand-picked gadgets our customers love.
              </p>
            </div>
          </div>
          {!products ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
