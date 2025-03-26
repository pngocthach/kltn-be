import { useEffect, useState } from "react";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  Users2,
} from "lucide-react";

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

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Affiliation {
  _id: string;
  name: string;
  parent?: string;
  users: User[];
  createdAt: string;
  updatedAt: string;
  authors?: string[];
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
}

function AffiliationItem({
  affiliation,
  allAffiliations,
  level = 0,
  onAddChild,
  onDelete,
  onEditAdmin,
  onEditAffiliation,
}: AffiliationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [isEditingAffiliation, setIsEditingAffiliation] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);

  // Find child affiliations
  const children = allAffiliations.filter((a) => a.parent === affiliation._id);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditingAffiliation(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Affiliation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditingAdmin(true)}>
                <Users2 className="mr-2 h-4 w-4" />
                Edit Administrators
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAddingChild(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Child Affiliation
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(affiliation._id)}
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
      />
      <CreateChildAffiliationDialog
        open={isAddingChild}
        onOpenChange={setIsAddingChild}
        parentAffiliation={affiliation}
        onSubmit={(values) => {
          onAddChild(affiliation._id, {
            name: values.name,
            adminName: values.adminName,
            adminEmail: values.adminEmail,
          });
          setIsAddingChild(false);
        }}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AffiliationTree() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const { data, isLoading, error } =
    tsr.affiliation.getRawAffiliations.useQuery({
      queryKey: ["/api/raw-affiliations"],
    });

  useEffect(() => {
    if (!isLoading && data) {
      setAffiliations(data.body as Affiliation[]);
    }
  }, [data, isLoading]);

  if (isLoading || error || !data || !data.body) {
    return <div>Unable to render data</div>;
  }

  // Get root level affiliations
  const rootAffiliations = affiliations.filter((a) => !a.parent);

  console.log("rootAffiliations:", rootAffiliations);
  console.log("affiliations:", affiliations);

  if (rootAffiliations.length === 0) {
    return <div>No affiliations found</div>;
  }

  // Add all other affiliations here

  // Update the handleAddChild function to include adminPassword
  const handleAddChild = (
    parentId: string,
    data: {
      name: string;
      adminName?: string;
      adminEmail?: string;
      adminPassword?: string;
    }
  ) => {
    // In a real app, this would call an API to create a new child affiliation
    console.log("Adding child to:", parentId, data);

    // For demo purposes, create a new affiliation
    const newAffiliation: Affiliation = {
      _id: `new-${Date.now()}`,
      name: data.name,
      parent: parentId,
      users: data.adminEmail
        ? [
            {
              _id: `user-${Date.now()}`,
              name: data.adminName || data.adminEmail,
              email: data.adminEmail,
              emailVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // setAffiliations([...affiliations, newAffiliation]);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would show a confirmation dialog
    console.log("Delete:", id);
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
    <div className="rounded-lg border">
      <div className="p-4">
        {rootAffiliations.map((affiliation) => (
          <AffiliationItem
            key={affiliation._id}
            affiliation={affiliation}
            allAffiliations={data.body as Affiliation[]}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onEditAdmin={handleEditAdmin}
            onEditAffiliation={handleEditAffiliation}
          />
        ))}
      </div>
    </div>
  );
}
