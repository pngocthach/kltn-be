import { useNavigate, useLocation } from "react-router-dom";
import { AffiliationTree } from "@/components/affiliations/affiliation-tree";
import { CreateAffiliationButton } from "@/components/affiliations/create-affiliation-button";

export default function AffiliationsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateToArticles = (affiliationId: string) => {
    // Use replace instead of push to avoid stacking navigation history
    navigate(`/articles?affiliations=${affiliationId}`, {
      replace: true,
      state: { from: location.pathname },
    });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliations</h1>
          <p className="text-muted-foreground">
            Manage your organization's affiliations and administrators.
          </p>
        </div>
        <CreateAffiliationButton />
      </div>
      <AffiliationTree onAffiliationClick={handleNavigateToArticles} />
    </div>
  );
}
