"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const loginSchema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(8, "Password must be at least 8 characters") });
const registerSchema = loginSchema.extend({ name: z.string().min(2, "Name must be at least 2 characters") });
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm | RegisterForm>({ resolver: zodResolver(isRegister ? registerSchema : loginSchema) });

  const onSubmit = async (values: LoginForm | RegisterForm) => {
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const data = values as RegisterForm;
        const { data: result, error: authError } = await supabase.auth.signUp({ email: data.email, password: data.password });
        if (authError) throw authError;
        if (result.user) {
          const { error: profileError } = await supabase.from("profiles").insert({ id: result.user.id, email: data.email, full_name: data.name, role: "USER" });
          if (profileError && profileError.code !== "23505") throw profileError;
        }
        router.push("/");
        router.refresh();
      } else {
        const data = values as LoginForm;
        const { error: authError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
        if (authError) throw authError;
        router.push(data.email.toLowerCase() === "admin@ecommerce.com" ? "/admin" : "/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete this request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{isRegister ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>{isRegister ? "Join TechHaven and track every order" : "Sign in to continue to TechHaven"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && <div className="space-y-2"><Label htmlFor="name">Full name</Label><div className="relative"><UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="name" className="pl-9" placeholder="Jane Doe" {...register("name" as "name")} /></div>{"name" in errors && errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>}
          <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" className="pl-9" placeholder="you@example.com" {...register("email")} /></div>{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="password" type="password" className="pl-9" placeholder="••••••••" {...register("password")} /></div>{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button className="w-full" size="lg" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isRegister ? "Create account" : "Sign in"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">{isRegister ? "Already have an account?" : "New to TechHaven?"}{" "}<Link className="font-medium text-primary hover:underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
      </CardContent>
    </Card>
  );
}
