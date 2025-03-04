import { useState } from "react";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

interface Author {
  _id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  articles: string[];
  affiliation: string[];
}

export function AuthorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [authors, setAuthors] = useState<Author[]>([
    {
      _id: "67b5d57056891e068b8447ba",
      name: "Lê Khánh Trình",
      url: "https://scholar.google.com/citations?user=Y1d3evoAAAAJ&hl=en",
      createdAt: "2025-02-19T12:58:24.208Z",
      updatedAt: "2025-02-19T12:58:24.208Z",
      articles: [
        "67b89e82c0674fd3ba558004",
        "67b89e83c0674fd3ba558005",
        "67b89e84c0674fd3ba558006",
        "67b89e85c0674fd3ba558007",
        "67b89e85c0674fd3ba558008",
        "67b89e86c0674fd3ba558009",
        "67b89e86c0674fd3ba55800a",
      ],
      affiliation: ["VNU", "UET", "Khoa Công nghệ thông tin"],
    },
    {
      _id: "67b5d68f56891e068b8447bc",
      name: "Nguyễn Thị Minh Huyền",
      url: "https://scholar.google.com/citations?user=Z8RQtMkAAAAJ&hl=en",
      createdAt: "2025-02-19T13:03:11.208Z",
      updatedAt: "2025-02-19T13:03:11.208Z",
      articles: [
        "67b89e87c0674fd3ba55800b",
        "67b89e88c0674fd3ba55800c",
        "67b89e89c0674fd3ba55800d",
      ],
      affiliation: ["VNU", "UET", "Khoa Công nghệ thông tin"],
    },
    {
      _id: "67b5d6ab56891e068b8447bd",
      name: "Nguyễn Hà Thanh",
      url: "https://scholar.google.com/citations?user=J3YCR4QAAAAJ&hl=en",
      createdAt: "2025-02-19T13:03:39.208Z",
      updatedAt: "2025-02-19T13:03:39.208Z",
      articles: ["67b89e8ac0674fd3ba55800e", "67b89e8bc0674fd3ba55800f"],
      affiliation: ["VNU", "UET", "Khoa Công nghệ thông tin"],
    },
  ]);

  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [crawlingAuthor, setCrawlingAuthor] = useState<Author | null>(null);

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAuthor = (id: string) => {
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
    setEditingAuthor(null);
  };

  const handleCrawlNow = (authorId: string) => {
    // In a real app, this would trigger an immediate crawl
    console.log("Crawling now for author:", authorId);
    setCrawlingAuthor(null);
  };

  const handleScheduleCrawl = (authorId: string, schedule: string) => {
    // In a real app, this would set up a scheduled crawl
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
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAuthors.map((author) => (
          <Card key={author._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{author.name}</h3>
                    <a
                      href={author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      Google Scholar <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      <DropdownMenuItem
                        onClick={() => setCrawlingAuthor(author)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Crawl Options
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

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Affiliation:</span>{" "}
                    <span className="text-muted-foreground">
                      {author.affiliation.join(" > ")}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Articles:</span>{" "}
                    <span className="text-muted-foreground">
                      {author.articles.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Last updated:{" "}
                  {format(new Date(author.updatedAt), "MMM d, yyyy")}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
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
          onCrawlNow={() => handleCrawlNow(crawlingAuthor._id)}
          onScheduleCrawl={(schedule) =>
            handleScheduleCrawl(crawlingAuthor._id, schedule)
          }
        />
      )}
    </div>
  );
}
