import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Headphones } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/30" />
      <div className="absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />

      <div className="container py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              New arrivals every week
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Premium tech for{" "}
              <span className="text-primary">everyday life</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Discover hand-picked electronics and gadgets from the brands you
              love — at prices that make sense.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Free shipping over $99
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> 2-year warranty
              </span>
              <span className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" /> 24/7 support
              </span>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="mt-8 overflow-hidden rounded-xl border shadow-lg">
                <img
                  src="https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Headphones"
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-xl border shadow-lg">
                <img
                  src="https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600"
                  alt="Laptop"
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="col-span-2 overflow-hidden rounded-xl border shadow-lg">
                <img
                  src="https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Smartwatch"
                  className="h-40 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
