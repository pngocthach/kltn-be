"use client";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Affiliation {
  _id: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  adminEmail: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
  adminName: z
    .string()
    .min(2, {
      message: "Admin name must be at least 2 characters.",
    })
    .optional(),
  adminPassword: z.string().optional(),
});

interface CreateChildAffiliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentAffiliation: Affiliation;
  onSubmit: (values: z.infer<typeof formSchema> & { parentId: string }) => void;
}

export function CreateChildAffiliationDialog({
  open,
  onOpenChange,
  parentAffiliation,
  onSubmit,
}: CreateChildAffiliationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminName: "",
      adminPassword: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      ...values,
      parentId: parentAffiliation._id,
    });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Child Affiliation</DialogTitle>
          <DialogDescription>
            Create a new affiliation under {parentAffiliation.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                name="adminName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrator Name (Optional)</FormLabel>
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
                    <FormLabel>Administrator Email (Optional)</FormLabel>
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
                    <FormLabel>Administrator Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter administrator password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
