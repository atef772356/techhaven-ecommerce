import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
