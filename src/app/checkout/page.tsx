"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { formatCurrency } from "@/lib/utils";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(4, "ZIP code is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = total();

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Checkout failed");
      }

      setSuccess(true);
      clearCart();
      addToast({ title: "Order placed!", description: "Thank you for your purchase." });
    } catch (error) {
      addToast({
        title: "Unable to place order",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. A confirmation email is on the way.
            </p>
            <Button asChild size="lg">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add items before checking out.</p>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
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
          <Link href="/cart">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border p-6 space-y-4">
                <h2 className="text-lg font-semibold">Contact & shipping</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Jane Doe" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St" {...register("address")} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="San Francisco" {...register("city")} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP code</Label>
                    <Input id="zip" placeholder="94103" {...register("zip")} />
                    {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6 space-y-2">
                <h2 className="text-lg font-semibold">Payment</h2>
                <p className="text-sm text-muted-foreground">Secure payment processing will be added in the next phase.</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-xl border p-6 space-y-4 sticky top-24">
                <h2 className="text-lg font-semibold">Your order</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground">Qty {item.quantity} · {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="text-xs text-muted-foreground">Shipping and tax are calculated securely when the order is submitted.</div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing order...</>
                  ) : (
                    <>Place order</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
