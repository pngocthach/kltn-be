import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NoPermission } from "./NoPermission";
import { tsr } from "@/App";

export function PermissionGuard({
  children,
  resourceId,
  resourceType,
  fallback = <NoPermission />,
}) {
  const { data, isLoading } = tsr.affiliation.checkPermission.useQuery({
    queryKey: ["/api/affiliation/check-permission"],
  });

  if (hasPermission === false) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
