import { useState } from "react";
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

interface AffiliationTreeProps {
  onAffiliationClick?: (affiliationId: string) => void;
}

interface AffiliationItemProps {
  affiliation: Affiliation;
  allAffiliations: Affiliation[];
  level?: number;
  onAddChild: (affiliation: Pick<Affiliation, "_id" | "name">) => void;
  onDelete: (id: string) => void;
  onEditAdmin: (id: string, users: string[]) => void;
  onEditAffiliation: (
    id: string,
    data: { name: string; parent?: string }
  ) => void;
  refetch: () => void;
  onAffiliationClick?: (affiliationId: string) => void;
  isUpdatingAdmins: boolean;
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
  onAffiliationClick,
  isUpdatingAdmins,
}: AffiliationItemProps) {
  // Change initial state to true
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [isEditingAffiliation, setIsEditingAffiliation] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);

  const children = allAffiliations.filter((a) => a.parent === affiliation._id);
  const hasChildren = children.length > 0;

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <div
          className="flex-1 cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
          onClick={() => onAffiliationClick?.(affiliation._id)}
        >
          <div className="flex items-center gap-2 p-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${!hasChildren && "invisible"}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </Button>
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
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
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
        key={affiliation._id}
        open={isEditingAdmin}
        onOpenChange={setIsEditingAdmin}
        currentAdmins={affiliation.users || []}
        onSubmit={(values) => {
          onEditAdmin(
            affiliation._id,
            values.users.map((user) => user.value)
          );
          setIsEditingAdmin(false);
        }}
        isLoading={isUpdatingAdmins}
      />
      <EditAffiliationDialog
        open={isEditingAffiliation}
        onOpenChange={setIsEditingAffiliation}
        currentAffiliation={{
          _id: affiliation._id,
          name: affiliation.name,
          parent: affiliation.parent,
        }}
        affiliations={allAffiliations.map((a) => ({
          _id: a._id,
          name: a.name,
          parent: a.parent,
        }))}
        onSuccess={() => {
          setIsEditingAffiliation(false);
          refetch();
        }}
      />
      <CreateChildAffiliationDialog
        open={isAddingChild}
        onOpenChange={(open) => setIsAddingChild(open)}
        parentAffiliation={{ _id: affiliation._id, name: affiliation.name }}
        refetch={refetch}
      />
      {isExpanded && hasChildren && (
        <div className="ml-4 mt-2">
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
              onAffiliationClick={onAffiliationClick}
              isUpdatingAdmins={isUpdatingAdmins}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AffiliationTree({ onAffiliationClick }: AffiliationTreeProps) {
  const { data, isLoading, error, refetch } =
    tsr.affiliation.getAffiliations.useQuery({
      queryKey: ["/api/affiliations"],
      // Add these options to prevent unnecessary refetches
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30000,
    });

  const [creatingChildFor, setCreatingChildFor] = useState<Pick<
    Affiliation,
    "_id" | "name"
  > | null>(null);

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

  const { mutate: updateAffiliationAdmins, isPending: isUpdatingAdmins } =
    tsr.affiliation.editAffiliation.useMutation({
      onSuccess: async () => {
        toast.success("Administrators updated successfully");
        await refetch();
      },
      onError: (error) => {
        toast.error("Failed to update administrators", {
          description: error.toString(),
        });
      },
    });

  if (isLoading || error || !data || !data.body) {
    return <div>Unable to render data</div>;
  }

  // Get root level affiliations
  const rootAffiliations = (data.body as Affiliation[]).filter(
    (a: Affiliation) => !a.parent
  );

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

  console.log("data.body:", data.body);

  const handleEditAdmin = (id: string, users: string[]) => {
    updateAffiliationAdmins({
      params: { id },
      body: { admins: users },
    });
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
          {rootAffiliations.map((affiliation: Affiliation) => (
            <AffiliationItem
              key={affiliation._id}
              affiliation={affiliation}
              allAffiliations={data.body as Affiliation[]}
              onAddChild={(aff) => setCreatingChildFor(aff)}
              onDelete={handleDelete}
              onEditAdmin={handleEditAdmin}
              onEditAffiliation={handleEditAffiliation}
              refetch={refetch}
              onAffiliationClick={onAffiliationClick}
              isUpdatingAdmins={isUpdatingAdmins}
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
          parentAffiliation={{
            _id: creatingChildFor._id,
            name: creatingChildFor.name,
          }}
          refetch={refetch}
        />
      )}
    </>
  );
}
