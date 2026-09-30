import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const checkoutRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(240),
  city: z.string().trim().min(2).max(120),
  zip: z.string().trim().min(4).max(20),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100),
  })).min(1).max(100),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: "Invalid checkout details",
      details: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: parsed.data.name,
    p_address: parsed.data.address,
    p_city: parsed.data.city,
    p_zip: parsed.data.zip,
    p_items: parsed.data.items,
  });

  if (error) {
    console.error("Checkout RPC failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: user.id,
    });

    const status = error.message.includes("Insufficient stock") ? 409 :
      error.message.includes("Product ") ? 409 : 500;
    return NextResponse.json({
      error: status === 500 ? "Unable to create order right now" : error.message,
    }, { status });
  }

  return NextResponse.json(data, { status: 201 });
}