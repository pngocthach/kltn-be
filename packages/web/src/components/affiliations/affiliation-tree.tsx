import { useState } from "react";
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
              <span>{affiliation.users.length} administrators</span>
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
        currentAdmins={affiliation.users}
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
  const [affiliations, setAffiliations] = useState<Affiliation[]>(
    [
      {
        _id: "67b1c2ea23349089e13ea132",
        name: "VNU",
        users: [
          {
            _id: "67b054d57050e48f8b33d3f5",
            name: "test@email.com",
            email: "test@email.com",
            emailVerified: false,
            createdAt: "2025-02-15T08:48:21.206Z",
            updatedAt: "2025-02-15T08:48:21.206Z",
          },
        ],
        createdAt: "2025-02-16T10:50:18.100Z",
        updatedAt: "2025-02-19T13:16:04.591Z",
        authors: [
          "67b5d8de56891e068b8447be",
          "67b5d68f56891e068b8447bc",
          "67b5d6ab56891e068b8447bd",
          "67b5d992be5db7e46c80c9fe",
        ],
      },
      {
        _id: "67b1c35dbf0dc8d3fc93b908",
        name: "UET",
        parent: "67b1c2ea23349089e13ea132",
        users: [
          {
            _id: "67b054d57050e48f8b33d3f5",
            name: "test@email.com",
            email: "test@email.com",
            emailVerified: false,
            createdAt: "2025-02-15T08:48:21.206Z",
            updatedAt: "2025-02-15T08:48:21.206Z",
          },
        ],
        createdAt: "2025-02-16T10:52:13.448Z",
        updatedAt: "2025-02-16T10:52:13.448Z",
      },
      {
        _id: "67b1d32c89529bb94ddf608f",
        name: "Khoa Công nghệ thông tin",
        parent: "67b1c35dbf0dc8d3fc93b908",
        users: [
          {
            _id: "67af8828aea1b1f73ed5139d",
            name: "a@mail.com",
            email: "a@mail.com",
            emailVerified: false,
            createdAt: "2025-02-14T18:15:04.937Z",
            updatedAt: "2025-02-14T18:15:04.937Z",
          },
          {
            _id: "67b054d57050e48f8b33d3f5",
            name: "test@email.com",
            email: "test@email.com",
            emailVerified: false,
            createdAt: "2025-02-15T08:48:21.206Z",
            updatedAt: "2025-02-15T08:48:21.206Z",
          },
        ],
        createdAt: "2025-02-16T11:59:40.246Z",
        updatedAt: "2025-02-19T14:51:00.071Z",
        authors: [
          "67b5d68f56891e068b8447bc",
          "67b5d6ab56891e068b8447bd",
          "67b5dac4be5db7e46c80c9ff",
          "67b5efa807db1134427437fb",
          "67b5d57056891e068b8447ba",
        ],
      },
      {
        _id: "67b1d33489529bb94ddf6090",
        name: "Khoa ĐTVT",
        parent: "67b1c35dbf0dc8d3fc93b908",
        users: [],
        createdAt: "2025-02-16T11:59:48.649Z",
        updatedAt: "2025-02-19T12:13:31.135Z",
      },
      {
        _id: "67b1d3b289529bb94ddf6091",
        name: "Bộ môn CNPM",
        parent: "67b1d32c89529bb94ddf608f",
        createdAt: "2025-02-16T12:01:54.433Z",
        updatedAt: "2025-02-19T12:53:06.228Z",
        users: [],
      },
      {
        _id: "67b1d3b689529bb94ddf6092",
        name: "Bộ môn KHMT",
        parent: "67b1d32c89529bb94ddf608f",
        createdAt: "2025-02-16T12:01:58.674Z",
        updatedAt: "2025-02-19T13:21:10.928Z",
        authors: ["67b5dac4be5db7e46c80c9ff"],
        users: [],
      },
      {
        _id: "67b5ca18110cbe0bc6b3be17",
        name: "Bộ môn MMT",
        parent: "67b1d32c89529bb94ddf608f",
        createdAt: "2025-02-19T12:10:00.351Z",
        updatedAt: "2025-02-19T12:10:00.351Z",
        users: [],
      },
      {
        _id: "67b5cad5110cbe0bc6b3be19",
        name: "Khoa gì đấy",
        parent: "67b5cabf110cbe0bc6b3be18",
        createdAt: "2025-02-19T12:13:09.388Z",
        updatedAt: "2025-02-19T12:13:09.388Z",
        users: [],
      },
      {
        _id: "67bb57930cbdcad33652e22c",
        name: "Tét",
        parent: "67b1d32c89529bb94ddf608f",
        createdAt: "2025-02-23T17:14:59.186Z",
        updatedAt: "2025-02-23T17:14:59.186Z",
        users: [],
      },
    ]
    // Add all other affiliations here
  );

  const handleAddChild = (
    parentId: string,
    data: { name: string; adminName?: string; adminEmail?: string }
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

    setAffiliations([...affiliations, newAffiliation]);
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

  // Get root level affiliations
  const rootAffiliations = affiliations.filter((a) => !a.parent);

  return (
    <div className="rounded-lg border">
      <div className="p-4">
        {rootAffiliations.map((affiliation) => (
          <AffiliationItem
            key={affiliation._id}
            affiliation={affiliation}
            allAffiliations={affiliations}
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
