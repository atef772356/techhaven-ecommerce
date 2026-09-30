"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, UserCircle, Package } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function UserMenu() {
  const [user, setUser] = useState<{ email?: string; name?: string; role?: string } | null>(null);
  const supabase = createSupabaseBrowserClient();
  useEffect(() => {
    const load = async () => {
      const { data: { user: current } } = await supabase.auth.getUser();
      if (!current) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", current.id).maybeSingle();
      setUser({ email: current.email, name: profile?.full_name || current.email?.split("@")[0], role: profile?.role });
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (!session) setUser(null); });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);
  const logout = async () => { await supabase.auth.signOut(); setUser(null); window.location.href = "/"; };
  return <div className="flex items-center gap-1"><ThemeToggle />{user ? <><Button asChild variant="ghost" size="sm" className="hidden sm:flex gap-2"><Link href={user.role === "ADMIN" ? "/admin" : "/my-orders"}><UserCircle className="h-4 w-4" />{user.name}</Link></Button><Button variant="ghost" size="icon" onClick={logout} aria-label="Log out"><LogOut className="h-4 w-4" /></Button></> : <Button asChild variant="ghost" size="icon" aria-label="Sign in"><Link href="/login"><LogIn className="h-5 w-5" /></Link></Button>}</div>;
}
