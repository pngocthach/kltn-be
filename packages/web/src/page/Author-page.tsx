import { tsr } from "@/App";
import { AuthorsList } from "@/components/authors/authors-list";
import { CreateAuthorButton } from "@/components/authors/create-author-button";
import { useNavigate } from "react-router-dom";

export default function AuthorsPage() {
  const navigate = useNavigate();
  const { refetch } = tsr.author.getAuthors.useQuery({
    queryKey: ["/api/authors"],
  });

  const mutation = tsr.author.createAuthor.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAuthorClick = (authorId: string) => {
    navigate(`/articles?authors=${authorId}`, {
      replace: true,
      state: { from: "/authors" },
    });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
          <p className="text-muted-foreground">
            Manage authors and their publication data.
          </p>
        </div>
        <CreateAuthorButton onCreate={mutation.mutate} />
      </div>
      <AuthorsList onAuthorClick={handleAuthorClick} />
    </div>
  );
}
