"use client";

import { tsr } from "@/App";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Author } from "@kltn/contract/api/article";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid Google Scholar URL.",
  }),
  affiliation: z.string().min(1, {
    message: "Please select an affiliation.",
  }),
});

interface EditAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: Author;
  onSubmit: (author: any) => void;
  isLoading: boolean;
}

export function EditAuthorDialog({
  open,
  onOpenChange,
  author,
  onSubmit,
  isLoading,
}: EditAuthorDialogProps) {
  const { data: affiliationsData } =
    tsr.affiliation.getRawAffiliations.useQuery({
      queryKey: ["/api/raw-affiliations"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: author.name,
      url: author.url,
      // Fix: Get the affiliation ID correctly
      affiliation: Array.isArray(author.affiliation)
        ? affiliationsData?.body.find(
            (aff) => aff.name === author.affiliation[0]
          )?._id || ""
        : author.affiliation,
    },
  });

  // Get the current affiliation path as a string
  const getCurrentAffiliationPath = () => {
    if (!author.affiliation) return "";
    if (Array.isArray(author.affiliation)) {
      return author.affiliation.join(" > ");
    }
    // If we have the ID, try to find the name from affiliations data
    if (affiliationsData?.body) {
      const aff = affiliationsData.body.find(
        (a) => a._id === author.affiliation
      );
      return aff ? aff.name : author.affiliation;
    }
    return author.affiliation;
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const updatedAuthor = {
      name: values.name,
      url: values.url,
      affiliation: values.affiliation, // This will now be the correct ID
      _id: author._id,
    };
    onSubmit(updatedAuthor);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Author</DialogTitle>
          <DialogDescription>Update author information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Scholar URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://scholar.google.com/citations?user=..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The URL of the author's Google Scholar profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affiliation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select affiliation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {affiliationsData?.body?.map((affiliation) => (
                        <SelectItem
                          key={affiliation._id}
                          value={affiliation._id}
                        >
                          {affiliation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current affiliation: {getCurrentAffiliationPath()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
