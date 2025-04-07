"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { tsr } from "@/App";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  parentId: z.string().optional(),
  adminEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  adminName: z.string().min(2, {
    message: "Admin name must be at least 2 characters.",
  }),
  adminPassword: z.string().optional(),
});

export function CreateAffiliationButton() {
  const [open, setOpen] = useState(false);

  const {
    data: affiliationsResponse,
    isLoading,
    refetch,
  } = tsr.affiliation.getAffiliations.useQuery({
    queryKey: ["/api/affiliations"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminName: "",
    },
  });

  const { mutate: createAffiliation, isPending: isCreating } =
    tsr.affiliation.createAffiliation.useMutation({
      onSuccess: async () => {
        toast.success("Affiliation created successfully");
        setOpen(false);
        form.reset();
        await refetch();
      },
      onError: (error) => {
        toast.error("Failed to create affiliation", {
          description: error.toString(),
        });
      },
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createAffiliation({
      body: {
        name: values.name,
        parent: values.parentId,
        admin: values.adminEmail
          ? {
              email: values.adminEmail,
              name: values.adminName,
              password: values.adminPassword,
            }
          : undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Affiliation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Affiliation</DialogTitle>
          <DialogDescription>
            Create a new affiliation and assign an administrator.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter affiliation name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Affiliation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent affiliation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : affiliationsResponse?.body ? (
                          affiliationsResponse.body.map((affiliation) => (
                            <SelectItem
                              key={affiliation._id}
                              value={affiliation._id}
                            >
                              {affiliation.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">
                            No affiliations found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional. Leave empty to create a top-level affiliation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrator Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter administrator name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrator Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter administrator email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrator Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter administrator password (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Leave empty to generate a random password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
