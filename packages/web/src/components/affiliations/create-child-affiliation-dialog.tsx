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
import { toast } from "sonner";
import { tsr } from "@/App";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    adminEmail: z
      .union([
        z.string().email({
          message: "Please enter a valid email address.",
        }),
        z.string().length(0),
      ])
      .optional(),
    adminName: z
      .union([
        z.string().min(2, {
          message: "Admin name must be at least 2 characters.",
        }),
        z.string().length(0),
      ])
      .optional(),
    adminPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any admin field is provided, email must be present and valid
      if (
        (data.adminName && data.adminName.length > 0) ||
        (data.adminPassword && data.adminPassword.length > 0)
      ) {
        return (
          !!data.adminEmail &&
          data.adminEmail.length > 0 &&
          data.adminEmail.includes("@")
        );
      }
      return true;
    },
    {
      message: "Admin email is required when providing admin details",
      path: ["adminEmail"],
    }
  );

interface CreateChildAffiliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentAffiliation: {
    _id: string;
    name: string;
  };
  onSubmit?: (value) => void;
  refetch: () => void;
}

export function CreateChildAffiliationDialog({
  open,
  onOpenChange,
  parentAffiliation,
  refetch,
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

  const { mutate: createAffiliation, isPending: isCreating } =
    tsr.affiliation.createAffiliation.useMutation({
      onSuccess: () => {
        toast.success("Child affiliation created successfully");
        onOpenChange(false);
        form.reset();
        refetch();
      },
      onError: (error) => {
        toast.error("Failed to create child affiliation: " + error);
      },
    });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createAffiliation({
      body: {
        name: values.name,
        parent: parentAffiliation._id,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Child Affiliation</DialogTitle>
          <DialogDescription>
            Create a new child affiliation under {parentAffiliation.name}
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
