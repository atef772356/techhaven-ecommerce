"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { ProductDetailClient } from "./product-detail-client";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product } from "@/lib/db";
import { Loader2 } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", Number(params.id))
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setProduct(null);
        } else {
          setProduct(data as Product);
        }
      });
  }, [params.id, supabase]);

  if (product === undefined) {
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
  if (product === null) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product!.name}</span>
          </nav>
          <ProductDetailClient product={product!} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
