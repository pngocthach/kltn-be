import { AuthorsList } from "@/components/authors/authors-list";
import { CreateAuthorButton } from "@/components/authors/create-author-button";

export default function AuthorsPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
          <p className="text-muted-foreground">
            Manage authors and their publication data.
          </p>
        </div>
        <CreateAuthorButton />
      </div>
      <AuthorsList />
    </div>
  );
}
