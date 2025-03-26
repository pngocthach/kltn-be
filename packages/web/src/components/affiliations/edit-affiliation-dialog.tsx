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

interface Affiliation {
  _id: string;
  name: string;
  parent?: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  parent: z.string().transform((val) => (val === "none" ? undefined : val)),
  adminPassword: z.string().optional(),
});

interface EditAffiliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAffiliation: Affiliation;
  affiliations: Affiliation[];
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function EditAffiliationDialog({
  open,
  onOpenChange,
  currentAffiliation,
  affiliations,
  onSubmit,
}: EditAffiliationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentAffiliation.name,
      parent: currentAffiliation.parent || "none",
      adminPassword: "",
    },
  });

  // Filter out the current affiliation and its children to prevent circular references
  const availableParents = affiliations.filter(
    (a) => a._id !== currentAffiliation._id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Affiliation</DialogTitle>
          <DialogDescription>Update the affiliation details.</DialogDescription>
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
                name="parent"
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
                        <SelectItem value="none">None</SelectItem>
                        {availableParents.map((affiliation) => (
                          <SelectItem
                            key={affiliation._id}
                            value={affiliation._id}
                          >
                            {affiliation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="Enter new admin password (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to keep current password. This will update the
                      password for all administrators.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
