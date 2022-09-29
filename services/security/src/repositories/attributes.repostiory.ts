import { QueryObject } from "./helpers/query-filter";
import { AttributeModel } from "../app/features/users/models/attribute.model";

export interface AttributesRepository {
  getAttributes: (queryObject: QueryObject) => Promise<{
    attributes: AttributeModel[];
    total: number;
  }>;
  delete: (ids: string[]) => Promise<any>;
}
