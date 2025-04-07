import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, error, isPending } = authClient.useSession();
  const nav = useNavigate();

  console.log(">>>cookie:", document.cookie);

  if (isPending) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Display an error message if there's an issue with authentication
  }

  if (!session) {
    nav("/login");
    return null; // Redirect to the login page if not authenticated
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="mt-3.5 ml-2.5" />
      {children}
    </SidebarProvider>
  );
}
