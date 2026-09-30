"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product } from "@/lib/db";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("products")
      .select("category")
      .then(({ data }) => {
        if (data) {
          const cats = [...new Set(data.map((d) => d.category))].sort();
          setCategories(cats);
        }
      });
  }, [supabase]);

  useEffect(() => {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (q) {
      query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    query.then(({ data, error }) => {
      if (error) {
        setProducts([]);
      } else {
        setProducts(data ?? []);
      }
    });
  }, [q, category, supabase]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const url = params.toString() ? `/products?${params.toString()}` : "/products";
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {q ? `Results for "${q}"` : "All products"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {products ? `${products.length} ${products.length === 1 ? "item" : "items"} available` : "Loading..."}
            </p>
          </div>

          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  (category === "all" || !category)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {!products ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No products found. Try a different search.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
