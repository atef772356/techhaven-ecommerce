import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — TechHaven",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-muted/30">{children}</div>;
}
