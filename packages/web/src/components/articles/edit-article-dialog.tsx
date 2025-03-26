import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ArticleMetadata {
  Authors: string;
  "Publication date"?: { $date: string };
  Conference?: string;
  Journal?: string;
  Volume?: string;
  Issue?: string;
  Pages?: string;
  Abstract?: string;
  Keywords?: string;

  [key: string]: any;
}

interface Article {
  _id: string;
  title: string;
  link: string;
  metadata: ArticleMetadata;
}

// Define the form schema
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  link: z.string().url("Please enter a valid URL."),
  publicationType: z.enum(["conference", "journal"]),
  authors: z.string().min(2, "Authors must be at least 2 characters."),
  publicationDate: z.date().optional(),
  conference: z.string().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  additionalMetadata: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article;
  onSubmit: (article: Article) => void;
}

export function EditArticleDialog({
  open,
  onOpenChange,
  article,
  onSubmit,
}: EditArticleDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Convert article data to form values
  const defaultValues: FormValues = {
    title: article.title,
    link: article.link,
    publicationType: article.metadata.Conference ? "conference" : "journal",
    authors: article.metadata.Authors,
    publicationDate: article.metadata["Publication date"]
      ? new Date(article.metadata["Publication date"].$date)
      : undefined,
    conference: article.metadata.Conference,
    journal: article.metadata.Journal,
    volume: article.metadata.Volume,
    issue: article.metadata.Issue,
    pages: article.metadata.Pages,
    abstract: article.metadata.Abstract,
    keywords: article.metadata.Keywords,
    additionalMetadata: Object.entries(article.metadata)
      .filter(
        ([key]) =>
          ![
            "Authors",
            "Publication date",
            "Conference",
            "Journal",
            "Volume",
            "Issue",
            "Pages",
            "Abstract",
            "Keywords",
          ].includes(key)
      )
      .map(([key, value]) => ({
        key,
        value:
          typeof value === "object" ? JSON.stringify(value) : value.toString(),
      })),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalMetadata",
  });

  // Watch the publication type to conditionally render fields
  const publicationType = form.watch("publicationType");

  function handleSubmit(values: FormValues) {
    // Convert form values back to article format
    const updatedMetadata: ArticleMetadata = {
      Authors: values.authors,
      ...(values.publicationDate && {
        "Publication date": {
          $date: values.publicationDate.toISOString(),
        },
      }),
      ...(values.publicationType === "conference" &&
        values.conference && { Conference: values.conference }),
      ...(values.publicationType === "journal" &&
        values.journal && { Journal: values.journal }),
      ...(values.publicationType === "journal" &&
        values.volume && { Volume: values.volume }),
      ...(values.publicationType === "journal" &&
        values.issue && { Issue: values.issue }),
      ...(values.pages && { Pages: values.pages }),
      ...(values.abstract && { Abstract: values.abstract }),
      ...(values.keywords && { Keywords: values.keywords }),
    };

    // Add additional metadata fields
    if (values.additionalMetadata) {
      values.additionalMetadata.forEach(({ key, value }) => {
        updatedMetadata[key] = value;
      });
    }

    const updatedArticle: Article = {
      ...article,
      title: values.title,
      link: values.link,
      metadata: updatedMetadata,
    };

    onSubmit(updatedArticle);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Update article information and metadata.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="publication">
                  Publication Details
                </TabsTrigger>
                <TabsTrigger value="additional">
                  Additional Metadata
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter article title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>
                        URL to the article (e.g., Google Scholar link)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Author 1, Author 2, ..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of authors
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publication Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && !isNaN(field.value.getTime()) ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              console.log("Selected date:", date);
                              field.onChange(date);
                            }}
                            disabled={(date) => {
                              const isDisabled = date > new Date();
                              console.log(
                                "Date:",
                                date,
                                "Is disabled:",
                                isDisabled
                              );
                              return isDisabled;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select publication type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="journal">Journal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Publication Details Tab */}
              <TabsContent value="publication" className="space-y-4 pt-4">
                {publicationType === "conference" && (
                  <FormField
                    control={form.control}
                    name="conference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter conference name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {publicationType === "journal" && (
                  <>
                    <FormField
                      control={form.control}
                      name="journal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Journal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter journal name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="volume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 42" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="issue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pages</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 123-145" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter article abstract"
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="keyword1, keyword2, ..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of keywords
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Additional Metadata Tab */}
              <TabsContent value="additional" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`additionalMetadata.${index}.key`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Metadata Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`additionalMetadata.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Metadata Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ key: "", value: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Metadata Field
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
