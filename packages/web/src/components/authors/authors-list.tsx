import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EditAuthorDialog } from "@/components/authors/edit-author-dialog";
import { CrawlOptionsDialog } from "@/components/authors/crawl-options-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tsr } from "@/App";
import { AuthorResponse as Author } from "@kltn/contract/api/author";
import { toast } from "sonner";

interface AuthorsListProps {
  onAuthorClick?: (authorId: string) => void;
}

export function AuthorsList({ onAuthorClick }: AuthorsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [crawlingAuthor, setCrawlingAuthor] = useState<Author | null>(null);

  // Define a constant query key to ensure consistency
  const QUERY_KEY = ["/api/authors"] as const;

  const { data, isLoading, refetch } = tsr.author.getAuthors.useQuery({
    queryKey: QUERY_KEY,
  });

  const deleteMutation = tsr.author.deleteAuthor.useMutation({
    onMutate: () => {
      // Disable any UI elements during deletion if needed
    },
    onSuccess: () => {
      toast.success("Author deleted successfully");
      // Force a hard refetch
      refetch({ throwOnError: true });
    },
    onError: (error) => {
      toast.error("Failed to delete author", {
        description: error.toString(),
      });
    },
  });

  const editMutation = tsr.author.editAuthor.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Filter authors based on search query
  const filteredAuthors = (data?.body || []).filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAuthor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      deleteMutation.mutate({ params: { id } });
    }
  };

  const handleEditAuthor = (updatedAuthor: Author) => {
    editMutation.mutate({
      params: { id: updatedAuthor._id },
      // TODO: fix type
      // @ts-expect-error idk
      body: updatedAuthor,
    });
    setEditingAuthor(null);
  };

  const handleCrawlNow = (author: Author) => {
    // In a real app, this would trigger an immediate crawl
    console.log("Crawling now for author:", author);
    setCrawlingAuthor(null);
    tsr.article.crawl.mutate({
      body: {
        url: author.url,
        authorId: author._id,
      },
    });
  };

  const handleScheduleCrawl = (authorId: string, schedule: number) => {
    // In a real app, this would set up a scheduled crawl
    editMutation.mutate({
      params: { id: authorId },
      body: { schedule },
    });
    console.log(
      "Scheduling crawl for author:",
      authorId,
      "Schedule:",
      schedule
    );
    setCrawlingAuthor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Affiliation</TableHead>
              <TableHead className="text-center">Articles</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAuthors.map((author) => (
              <TableRow
                key={author._id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onAuthorClick?.(author._id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{author.name}</span>
                    {author.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(author.url, "_blank");
                        }}
                        title="Open Google Scholar Profile"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {author.affiliation &&
                      Array.isArray(author.affiliation) &&
                      author.affiliation.join(" > ")}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">
                    {author.articles?.length || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(author.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {" "}
                    {/* Prevent row click when clicking actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCrawlingAuthor(author)}
                      title="Crawl Options"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingAuthor(author)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Author
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteAuthor(author._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingAuthor && (
        <EditAuthorDialog
          open={!!editingAuthor}
          onOpenChange={(open) => !open && setEditingAuthor(null)}
          author={editingAuthor}
          onSubmit={handleEditAuthor}
        />
      )}

      {crawlingAuthor && (
        <CrawlOptionsDialog
          open={!!crawlingAuthor}
          onOpenChange={(open) => !open && setCrawlingAuthor(null)}
          author={crawlingAuthor}
          onCrawlNow={() => handleCrawlNow(crawlingAuthor)}
          onScheduleCrawl={(schedule) =>
            handleScheduleCrawl(crawlingAuthor._id, schedule)
          }
        />
      )}
    </div>
  );
}
