import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Users2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tsr } from "@/App";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();

  const { data: response, isLoading } = tsr.article.getArticle.useQuery({
    queryKey: ["/api/articles", id!],
    queryData: {
      params: { id: id! },
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          Loading article details...
        </div>
      </div>
    );
  }

  if (!response?.body) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Article not found</p>
          <Link
            to="/articles"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const article = response.body;
  const authors = article.metadata.Authors.split(", ");

  // Extract metadata fields for display
  const publicationDate = article.metadata["Publication date"]
    ? new Date(article.metadata["Publication date"].$date).toLocaleDateString()
    : null;

  const publicationType = article.metadata.Conference
    ? { type: "Conference", name: article.metadata.Conference }
    : article.metadata.Journal
    ? { type: "Journal", name: article.metadata.Journal }
    : null;

  return (
    <div className="container mx-auto py-6">
      {/* Back button */}
      <Link
        to="/articles"
        className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Articles
      </Link>

      {/* Article header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 flex-shrink-0 text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>

        {/* Authors */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            {authors.map((author, index) => (
              <span key={index} className="font-medium text-foreground">
                {author}
                {index < authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-6 text-sm">
          {publicationDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Published: {publicationDate}</span>
            </div>
          )}

          {publicationType && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                {publicationType.type}: {publicationType.name}
              </span>
            </div>
          )}

          {article.metadata.Volume && article.metadata.Issue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                Volume: {article.metadata.Volume}, Issue:{" "}
                {article.metadata.Issue}
              </span>
            </div>
          )}

          {article.metadata.Pages && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Pages: {article.metadata.Pages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="metadata" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          {article.metadata.Abstract && (
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="metadata">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold">All Metadata</h3>
                <div className="grid gap-2">
                  {Object.entries(article.metadata).map(([key, value]) => {
                    const displayValue =
                      key === "Publication date"
                        ? new Date(value.$date).toLocaleDateString()
                        : typeof value === "object"
                        ? JSON.stringify(value)
                        : value;

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-3 gap-4 border-b pb-2"
                      >
                        <div className="font-medium">{key}</div>
                        <div className="col-span-2">{displayValue}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {article.metadata.Abstract && (
          <TabsContent value="abstract">
            <Card>
              <CardContent className="pt-6">
                <p className="leading-7">{article.metadata.Abstract}</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
