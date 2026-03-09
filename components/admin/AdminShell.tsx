import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AdminShell({ children, title }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40">
      <AdminHeader title={title} />
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
