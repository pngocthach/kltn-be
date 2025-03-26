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
  onSubmit: (author: Author) => void;
}

export function EditAuthorDialog({
  open,
  onOpenChange,
  author,
  onSubmit,
}: EditAuthorDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: author.name,
      url: author.url,
      affiliation: author.affiliation[author.affiliation.length - 1], // Most specific affiliation
    },
  });

  const { data } = tsr.affiliation.getAffiliations.useQuery({
    queryKey: ["/api/affiliations"],
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would update the author via API
    const updatedAuthor: Author = {
      ...author,
      name: values.name,
      url: values.url,
      // In a real app, you would need to handle the full affiliation path
      affiliation: author.affiliation, // This is simplified
      updatedAt: new Date().toISOString(),
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select affiliation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data &&
                        data.body.map((affiliation) => (
                          <SelectItem
                            key={affiliation._id}
                            value={affiliation.name}
                          >
                            {affiliation.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current affiliation path: {author.affiliation.join(" > ")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
