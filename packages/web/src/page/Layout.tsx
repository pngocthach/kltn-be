import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, error, isPending } = authClient.useSession();
  const nav = useNavigate();

  useEffect(() => {
    if (!isPending && (error || !session)) {
      console.error(error);
      nav("/login");
    }
  }, [error, session, isPending, nav]);

  if (isPending) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="mt-3.5 ml-2.5" />
      {children}
    </SidebarProvider>
  );
}
