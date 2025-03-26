import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditArticleDialog } from "@/components/articles/edit-article-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { tsr } from "@/App";

interface ArticleMetadata {
  Authors: string;
  "Publication date"?: { $date: string };
  Conference?: string;
  Journal?: string;

  [key: string]: any;
}

interface Article {
  _id: string;
  title: string;
  link: string;
  metadata: ArticleMetadata;
}

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [articles, setArticles] = useState<any>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(
    null
  );

  const { data: articlesResponse, isLoading } =
    tsr.article.getArticles.useQuery({
      queryKey: ["/api/articles"],
    });
  useEffect(() => {
    if (!isLoading && articlesResponse) {
      setArticles(articlesResponse.body);
    }
  }, [isLoading, articlesResponse]);

  // Filter articles based on search query
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.metadata.Authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalItems = filteredArticles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleEditArticle = (updatedArticle: Article) => {
    // In a real app, this would call an API to update the article
    setArticles(
      articles.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )
    );
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    // In a real app, this would call an API to delete the article
    setArticles(articles.filter((article) => article._id !== id));
    setDeletingArticleId(null);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items: any[] = [];
    const maxVisiblePages = 5; // Maximum number of page links to show

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the first page
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the last page
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <p className="text-muted-foreground">
          Browse and search through all published articles.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Most Recent</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Articles list */}
      <div className="space-y-4">
        {currentArticles.map((article) => (
          <Card
            key={article._id}
            className="overflow-hidden transition-colors hover:bg-muted/50"
          >
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Link to={`/articles/${article._id}`}>
                    <h2 className="text-xl font-semibold tracking-tight hover:underline">
                      {article.title}
                    </h2>
                  </Link>
                  <div className="flex items-center gap-2">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingArticle(article)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Article
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingArticleId(article._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{article.metadata.Authors}</span>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 text-sm">
                  {article.metadata["Publication date"] && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          article.metadata["Publication date"].$date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {article.metadata.Conference && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Conference:</span>
                      <span>{article.metadata.Conference}</span>
                    </div>
                  )}

                  {article.metadata.Journal && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Journal:</span>
                      <span>{article.metadata.Journal}</span>
                    </div>
                  )}
                </div>

                {/* Display additional metadata fields */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(article.metadata).map(([key, value]) => {
                    // Skip already displayed fields
                    if (
                      [
                        "Authors",
                        "Publication date",
                        "Conference",
                        "Journal",
                      ].includes(key)
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-medium"
                      >
                        {key}:{" "}
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Link to={`/articles/${article._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0 text-primary hover:bg-transparent hover:text-primary/80"
                    >
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{totalItems}</span> articles
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Article Dialog */}
      {editingArticle && (
        <EditArticleDialog
          open={!!editingArticle}
          onOpenChange={(open) => !open && setEditingArticle(null)}
          article={editingArticle}
          onSubmit={handleEditArticle}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingArticleId}
        onOpenChange={(open) => !open && setDeletingArticleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingArticleId && handleDeleteArticle(deletingArticleId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
