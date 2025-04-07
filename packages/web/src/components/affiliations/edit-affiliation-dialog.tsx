import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { tsr } from "@/App";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parent: z.string().optional(),
});

interface EditAffiliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAffiliation: {
    _id: string;
    name: string;
    parent?: string;
  };
  affiliations: {
    _id: string;
    name: string;
    parent?: string;
  }[];
  onSuccess?: () => void;
}

export function EditAffiliationDialog({
  open,
  onOpenChange,
  currentAffiliation,
  affiliations,
  onSuccess,
}: EditAffiliationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentAffiliation.name,
      parent: currentAffiliation.parent || "none",
    },
  });

  // Filter out the current affiliation and its children to prevent circular references
  const availableParents = affiliations.filter(
    (a) => a._id !== currentAffiliation._id
  );

  const { mutate: updateAffiliation } =
    tsr.affiliation.editAffiliation.useMutation({
      onSuccess: () => {
        toast.success("Affiliation updated successfully");
        setIsSubmitting(false);
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Failed to update affiliation", {
          description: error.toString(),
        });
        setIsSubmitting(false);
      },
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const updateData = {
      name: values.name,
      parent: values.parent === "none" ? undefined : values.parent,
    };

    updateAffiliation({
      params: { id: currentAffiliation._id },
      body: updateData,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Affiliation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      <SelectItem value="none">None (Root Level)</SelectItem>
                      {availableParents.map((aff) => (
                        <SelectItem key={aff._id} value={aff._id}>
                          {aff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
