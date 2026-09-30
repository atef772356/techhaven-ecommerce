import Link from "next/link";
import { Zap } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/30 flex flex-col items-center justify-center p-4"><Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-5 w-5" fill="currentColor" /></span>TechHaven</Link><AuthForm mode="login" /></main>;
}
