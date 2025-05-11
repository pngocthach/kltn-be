import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FileText,
  GraduationCap,
  Home,
  Library,
  Settings,
  Users2,
  Clock,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const nav = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    nav("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6" />
          <span className="font-semibold">Article Analytics</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/")}>
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/articles")}>
              <FileText className="h-4 w-4" />
              <span>Articles</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/authors")}>
              <Users2 className="h-4 w-4" />
              <span>Authors</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/affiliations")}>
              <GraduationCap className="h-4 w-4" />
              <span>Affiliations</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/crawl-jobs")}>
              <Clock className="h-4 w-4" />
              <span>Crawl Jobs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/similar-articles")}>
              <Copy className="h-4 w-4" />
              <span>Similar Articles</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => nav("/settings")}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="text-xs text-muted-foreground">Version 1.0.0</div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
