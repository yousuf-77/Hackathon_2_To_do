import { redirect } from "next/navigation";
import { NavbarClient } from "@/components/layout/navbar-client";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side: Just check if session cookie exists, don't try to validate it
  // The NavbarClient component will handle fetching user data client-side
  return (
    <div className="min-h-screen bg-background">
      <NavbarClient />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
