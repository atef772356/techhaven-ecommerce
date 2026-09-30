"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/db";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const { addToast } = useToast();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{Number(product.rating).toFixed(1)}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{product.stock} in stock</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold leading-tight line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(Number(product.price))}</span>
          <Button
            size="sm"
            onClick={() => {
              addItem(product);
              addToast({ title: "Added to cart", description: product.name });
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
