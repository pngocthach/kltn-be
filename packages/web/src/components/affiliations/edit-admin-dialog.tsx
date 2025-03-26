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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().optional(),
});

const formSchema = z.object({
  users: z.array(userSchema).min(1, "At least one administrator is required."),
});

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAdmins: User[];
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function EditAdminDialog({
  open,
  onOpenChange,
  currentAdmins,
  onSubmit,
}: EditAdminDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: currentAdmins.map((admin) => ({
        name: admin.name,
        email: admin.email,
        password: "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Administrators</DialogTitle>
          <DialogDescription>
            Update the administrators for this affiliation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name={`users.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administrator Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`users.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administrator Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`users.${index}.password`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administrator Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password (optional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to keep current password
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-6"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ name: "", email: "", password: "" })}
            >
              Add Administrator
            </Button>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
