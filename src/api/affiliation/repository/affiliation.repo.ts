import { Affiliation, AffiliationDocument } from "../affiliation.model";
import { AffWithHierarchyDto } from "../dto/aff-with-hierachy.dto";

export interface AffiliationRepo {
  getAll(): Promise<AffiliationDocument[]>;
  getById(id: string): Promise<AffiliationDocument | null>;
  create(affiliation: Affiliation): Promise<AffiliationDocument>;
  update(
    id: string,
    affiliation: Partial<Affiliation>
  ): Promise<AffiliationDocument | undefined>;
  delete(id: string): Promise<AffiliationDocument | null>;
  getAllWithHierarchy(): Promise<AffWithHierarchyDto[]>;
  getOneWithHierarchy(id: string): Promise<AffWithHierarchyDto | null>;
  getAllUsersInAffiliation(id: string): Promise<string[] | undefined>;
}
