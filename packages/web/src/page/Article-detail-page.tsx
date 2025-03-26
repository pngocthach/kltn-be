import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Users2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// This would normally come from an API or database
const getArticle = (id: string): Article => {
  const articles: Article[] = [
    {
      _id: "67b89e84c0674fd3ba558006",
      title: "A Novel Method for High-Fidelity Web Element Identification",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=7gFdUb4AAAAJ&sortby=pubdate&citation_for_view=7gFdUb4AAAAJ:4fKUyHm3Qg0C",
      metadata: {
        Authors:
          "Le-Khanh Trinh, Bui-The Cong, Pham-Hoang An, Hoang-Van Quyen, Cao-Thi-Minh Tam, Pham Ngoc Hung",
        "Publication date": {
          $date: "2024-01-01T00:00:00.000Z",
        },
        Conference:
          "The 16th International Conference on Knowledge and Systems Engineering (KSE 2024)",
        Abstract:
          "This paper presents a novel method for high-fidelity web element identification using advanced machine learning techniques. Our approach combines visual features with contextual information to accurately identify and locate web elements across different websites and applications. Experimental results show that our method outperforms existing approaches by a significant margin.",
        Keywords:
          "Web Element Identification, Machine Learning, Computer Vision, Web Automation",
      },
    },
    {
      _id: "67b89e85c0674fd3ba558007",
      title:
        "Improving Web Element Detection with Visual and Contextual Features",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=7gFdUb4AAAAJ&citation_for_view=7gFdUb4AAAAJ:d1gkVwhDpl0C",
      metadata: {
        Authors: "Le-Khanh Trinh, Nguyen Ha Thanh, Nguyen Thi Minh Huyen",
        "Publication date": {
          $date: "2023-09-15T00:00:00.000Z",
        },
        Journal: "IEEE Transactions on Software Engineering",
        Volume: "49",
        Issue: "9",
        Pages: "3721-3736",
        Abstract:
          "Web element detection is a critical task in web automation and testing. This paper proposes a novel approach that combines visual features with contextual information to improve the accuracy of web element detection. Our method achieves state-of-the-art performance on benchmark datasets.",
        Keywords:
          "Web Element Detection, Visual Features, Contextual Features, Web Automation",
      },
    },
    {
      _id: "67b89e86c0674fd3ba558009",
      title: "A Comprehensive Survey of Web Element Identification Techniques",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=7gFdUb4AAAAJ&citation_for_view=7gFdUb4AAAAJ:u5HHmVD_uO8C",
      metadata: {
        Authors: "Le-Khanh Trinh, Pham Ngoc Hung, Nguyen Thi Minh Huyen",
        "Publication date": {
          $date: "2023-06-22T00:00:00.000Z",
        },
        Journal: "ACM Computing Surveys",
        Volume: "55",
        Issue: "4",
        Pages: "1-34",
      },
    },
  ];

  return articles.find((article) => article._id === id) || articles[0];
};

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const article = getArticle(params.id || "");
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
      </Tabs>
    </div>
  );
}
