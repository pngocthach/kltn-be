import { useEffect, useState } from "react";
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

// interface Author {
//   _id: string;
//   name: string;
//   url: string;
//   createdAt: string;
//   updatedAt: string;
//   articles: string[];
//   affiliation: string[];
// }

export function AuthorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [crawlingAuthor, setCrawlingAuthor] = useState<Author | null>(null);

  const { data, isLoading } = tsr.author.getAuthors.useQuery({
    queryKey: ["/api/authors"],
  });

  useEffect(() => {
    if (!isLoading && data) {
      setAuthors(data.body as Author[]);
    }
  }, [isLoading, data]);

  // Filter authors based on search query
  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAuthor = (id: string) => {
    tsr.author.deleteAuthor.mutate({ params: { id } });
    // In a real app, this would call an API to delete the author
    setAuthors(authors.filter((author) => author._id !== id));
  };

  const handleEditAuthor = (updatedAuthor: Author) => {
    // In a real app, this would call an API to update the author
    setAuthors(
      authors.map((author) =>
        author._id === updatedAuthor._id ? updatedAuthor : author
      )
    );

    tsr.author.editAuthor.mutate({
      params: { id: updatedAuthor._id },
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
    tsr.author.editAuthor.mutate({
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
              <TableRow key={author._id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{author.name}</div>
                    <a
                      href={author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      Google Scholar <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {author.affiliation.join(" > ")}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{author.articles.length}</span>
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
                  <div className="flex justify-end gap-2">
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
