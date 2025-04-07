import { useEffect, useState, useMemo } from "react";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { EditAdminDialog } from "@/components/affiliations/edit-admin-dialog";
import { EditAffiliationDialog } from "@/components/affiliations/edit-affiliation-dialog";
import { CreateChildAffiliationDialog } from "@/components/affiliations/create-child-affiliation-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tsr } from "@/App";
import { AffiliationResponse as Affiliation } from "@kltn/contract/api/affiliation";

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AffiliationItemProps {
  affiliation: Affiliation;
  allAffiliations: Affiliation[];
  level?: number;
  onAddChild: (
    parentId: string,
    data: { name: string; adminName?: string; adminEmail?: string }
  ) => void;
  onDelete: (id: string) => void;
  onEditAdmin: (id: string, users: User[]) => void;
  onEditAffiliation: (
    id: string,
    data: { name: string; parent?: string }
  ) => void;
  refetch: () => void;
}

function AffiliationItem({
  affiliation,
  allAffiliations,
  level = 0,
  onAddChild,
  onDelete,
  onEditAdmin,
  onEditAffiliation,
  refetch,
}: AffiliationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [isEditingAffiliation, setIsEditingAffiliation] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Find child affiliations
  const children = useMemo(
    () => allAffiliations.filter((a) => a.parent === affiliation._id),
    [allAffiliations, affiliation._id]
  );
  const hasChildren = children.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${!hasChildren && "invisible"}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </Button>
        <div
          className="flex flex-1 items-center justify-between rounded-md border px-4 py-2 hover:bg-muted/50"
          style={{ marginLeft: !hasChildren ? 24 : 0 }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium">{affiliation.name}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users2 className="h-4 w-4" />
              <span>
                {affiliation.users && affiliation.users.length} administrators
              </span>
              {affiliation.authors && (
                <>
                  <span>•</span>
                  <span>{affiliation.authors.length} authors</span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setIsEditingAffiliation(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Affiliation
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsEditingAdmin(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Users2 className="mr-2 h-4 w-4" />
                Edit Administrators
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setIsAddingChild(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Child Affiliation
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  onDelete(affiliation._id);
                  setIsDropdownOpen(false);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <EditAdminDialog
        open={isEditingAdmin}
        onOpenChange={setIsEditingAdmin}
        currentAdmins={affiliation.users || []}
        onSubmit={(values) => {
          // @ts-expect-error idk
          onEditAdmin(affiliation._id, values.users);
          setIsEditingAdmin(false);
        }}
      />
      <EditAffiliationDialog
        open={isEditingAffiliation}
        onOpenChange={setIsEditingAffiliation}
        currentAffiliation={affiliation}
        affiliations={allAffiliations}
        onSubmit={(values) => {
          onEditAffiliation(affiliation._id, values);
          setIsEditingAffiliation(false);
        }}
        onSuccess={refetch}
      />
      <CreateChildAffiliationDialog
        open={isAddingChild}
        onOpenChange={setIsAddingChild}
        parentAffiliation={affiliation}
        refetch={refetch}
      />
      {hasChildren && isExpanded && (
        <div className="ml-4 space-y-2 border-l pl-4">
          {children.map((child) => (
            <AffiliationItem
              key={child._id}
              affiliation={child}
              allAffiliations={allAffiliations}
              level={level + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onEditAdmin={onEditAdmin}
              onEditAffiliation={onEditAffiliation}
              refetch={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AffiliationTree() {
  const { data, isLoading, error, refetch } =
    tsr.affiliation.getAffiliations.useQuery({
      queryKey: ["/api/affiliations"],
      // Add these options to prevent unnecessary refetches
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30000,
    });

  const [creatingChildFor, setCreatingChildFor] = useState<Affiliation | null>(
    null
  );

  const { mutate: deleteAffiliation } =
    tsr.affiliation.deleteAffiliation.useMutation({
      onSuccess: async () => {
        toast.success("Affiliation deleted successfully");
        await refetch();
      },
      onError: (error) => {
        toast.error("Failed to delete affiliation", {
          description: error.toString(),
        });
      },
    });

  if (isLoading || error || !data || !data.body) {
    return <div>Unable to render data</div>;
  }

  // Get root level affiliations
  const rootAffiliations = data.body.filter((a) => !a.parent);

  console.log("rootAffiliations:", rootAffiliations);
  console.log("affiliations:", data.body);

  if (rootAffiliations.length === 0) {
    return <div>No affiliations found</div>;
  }

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this affiliation and all its children? This action cannot be undone."
      )
    ) {
      deleteAffiliation({ params: { id } });
    }
  };

  const handleEditAdmin = (id: string, users: User[]) => {
    // In a real app, this would update the users in the database
    console.log("Edit admins for:", id, users);
  };

  const handleEditAffiliation = (
    id: string,
    data: { name: string; parent?: string }
  ) => {
    // In a real app, this would update the affiliation in the database
    console.log("Edit affiliation:", id, data);
  };

  return (
    <>
      <div className="rounded-lg border">
        <div className="p-4">
          {rootAffiliations.map((affiliation) => (
            <AffiliationItem
              key={affiliation._id}
              affiliation={affiliation}
              allAffiliations={data.body}
              onAddChild={(aff) => setCreatingChildFor(aff)}
              onDelete={handleDelete}
              onEditAdmin={handleEditAdmin}
              onEditAffiliation={handleEditAffiliation}
              refetch={refetch}
            />
          ))}
        </div>
      </div>

      {creatingChildFor && (
        <CreateChildAffiliationDialog
          open={!!creatingChildFor}
          onOpenChange={(open) => {
            if (!open) setCreatingChildFor(null);
          }}
          parentAffiliation={creatingChildFor}
          refetch={refetch}
        />
      )}
    </>
  );
}
