"use client";

import type React from "react";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Library,
  Search,
  Settings,
  Users2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
import { ArticlesTable } from "./articles-table";
import { AffiliationChart } from "./charts/affiliation-chart";
import { AuthorChart } from "./charts/author-chart";
import { ArticlePieChart } from "./charts/pie-chart";
import { TimelineChart } from "./charts/timeline-chart";
import { tsr } from "@/App";

export function Dashboard() {
  const [search, setSearch] = useState("");
  const { data: totalArticles, isLoading: totalArticlesLoading } =
    tsr.getTotalArticles.useQuery({
      queryKey: ["/total-article"],
    });

  const { data: totalAuthors, isLoading: totalAuthorsLoading } =
    tsr.getTotalAuthors.useQuery({
      queryKey: ["/total-authors"],
    });

  const { data: totalAffiliations, isLoading: totalAffiliationsLoading } =
    tsr.getTotalAffiliations.useQuery({
      queryKey: ["/total-affiliations"],
    });

  return (
    <div className="flex min-h-screen w-full mx-10">
      {/* <Sidebar>
      <SidebarHeader className="border-b p-4">
      <div className="flex items-center gap-2">
      <Library className="h-6 w-6" />
      <span className="font-semibold">Article Analytics</span>
      </div>
      </SidebarHeader>
      <SidebarContent>
      <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
        <FileText className="h-4 w-4" />
        <span>Articles</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
        <Users2 className="h-4 w-4" />
        <span>Authors</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
        <GraduationCap className="h-4 w-4" />
        <span>Affiliations</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
        <Settings className="h-4 w-4" />
        <span>Settings</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
      <div className="text-xs text-muted-foreground">Version 1.0.0</div>
      </SidebarFooter>
      </Sidebar> */}
      <div className="flex-1">
        <header className="border-b">
          <div className="flex h-14 items-center gap-4 px-4">
            {/* <SidebarTrigger /> */}
            <div className="flex flex-1 items-center gap-4">
              <form className="flex-1 md:max-w-sm">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="w-full bg-background pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </form>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Articles
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalArticlesLoading
                    ? "Loading..."
                    : totalArticles?.body.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Authors
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalAuthorsLoading
                    ? "Loading..."
                    : totalAuthors?.body.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalAuthorsLoading
                    ? "Loading..."
                    : `+${totalAuthors?.body.increase} from last month`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Affiliations
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalAffiliationsLoading
                    ? "Loading..."
                    : totalAffiliations?.body.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalAffiliationsLoading
                    ? "Loading..."
                    : `
                  +${totalAffiliations?.body.increase} from last month`}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Articles Timeline</CardTitle>
                <CardDescription>
                  Number of articles published over time
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-full">
                <TimelineChart className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Articles by Type</CardTitle>
                <CardDescription>
                  Distribution of articles across types
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ArticlePieChart className="h-[300px] w-full max-w-[500px]" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Articles by Affiliation</CardTitle>
                <CardDescription>
                  Distribution of articles across affiliations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AffiliationChart className="h-[300px]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Authors</CardTitle>
                <CardDescription>
                  Authors with the most published articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorChart className="h-[300px]" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest published articles</CardDescription>
              </CardHeader>
              <CardContent>
                <ArticlesTable />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
