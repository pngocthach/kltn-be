import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { tsr } from "@/App";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimilarityStatus } from "@kltn/contract/api/similiar-article";

interface SimilarArticle {
  _id: string;
  articleId: string;
  title: string;
  similarTo: {
    articleId: string;
    title: string;
    similarity: number;
  };
}

export default function SimilarArticlesPage() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: similarArticles,
    isLoading,
    refetch,
  } = tsr.similarArticle.getSimilarArticles.useQuery({
    queryKey: ["/api/similar-articles"],
  });

  const { mutate: checkSimilarity } =
    tsr.similarArticle.checkSimilarity.useMutation({
      onSuccess: () => {
        toast.success("Article status updated successfully");
        refetch();
      },
      onError: (error) => {
        toast.error("Failed to update article status");
      },
    });

  const sortedArticles = [...(similarArticles?.body || [])].sort((a, b) => {
    return sortOrder === "desc"
      ? b.similarTo.similarity - a.similarTo.similarity
      : a.similarTo.similarity - b.similarTo.similarity;
  });

  const handleMarkAsDuplicate = (id: string) => {
    checkSimilarity({
      params: { id },
      body: { status: SimilarityStatus.DUPLICATE },
    });
  };

  const handleMarkAsNotDuplicate = (id: string) => {
    checkSimilarity({
      params: { id },
      body: { status: SimilarityStatus.NOT_DUPLICATE },
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Similar Articles</h1>
        <p className="text-muted-foreground">
          Review and manage potentially similar or duplicate articles.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Similar Articles</CardTitle>
          <Select
            value={sortOrder}
            onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by similarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Highest Similarity First</SelectItem>
              <SelectItem value="asc">Lowest Similarity First</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Similar To</TableHead>
                  <TableHead className="text-right">Similarity Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedArticles.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          to={`/articles/${item.articleId}`}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          to={`/articles/${item.similarTo.articleId}`}
                          className="font-medium hover:underline"
                        >
                          {item.similarTo.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {(item.similarTo.similarity * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsDuplicate(item._id)}
                        >
                          Mark as Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsNotDuplicate(item._id)}
                        >
                          Not Duplicate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
