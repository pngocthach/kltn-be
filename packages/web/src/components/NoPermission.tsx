import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export function NoPermission() {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">No Permission</h1>
        <p className="mb-6 text-muted-foreground">
          You don't have permission to access this resource. Please contact your administrator
          or sign out and log in with a different account.
        </p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  );
}