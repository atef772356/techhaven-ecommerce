"use client";

import { useState } from "react";
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/db";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const { addToast } = useToast();

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <div className="overflow-hidden rounded-xl border bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover aspect-square"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium">
            {product.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{Number(product.rating).toFixed(1)}</span>
          <span>·</span>
          <span>{product.stock} in stock</span>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(Number(product.price))}</p>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{qty}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              for (let i = 0; i < qty; i++) addItem(product);
              addToast({ title: "Added to cart", description: `${qty} × ${product.name}` });
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to cart
          </Button>
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border p-4 text-sm">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Free shipping on orders over $99</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> 2-year manufacturer warranty</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> 30-day money-back guarantee</div>
        </div>

        <Link href="/products">
          <Button variant="ghost" className="mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to products
          </Button>
        </Link>
      </div>
    </div>
  );
}
