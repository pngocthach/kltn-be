import {
  Affiliation,
  AffiliationDocument,
} from "../../author/affiliation/affliation.model";

type AffHierarchy = AffiliationDocument & { level: number };
export type AffWithHierarchyDto = AffiliationDocument & AffHierarchy[];
