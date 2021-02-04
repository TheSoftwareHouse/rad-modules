import { Command } from "@tshio/command-bus";
import { FilterOperators } from "../../../../repositories/helpers/query-filter";
import { PolicyModelGeneric } from "../models/policy.model";

export const GET_POLICIES_COMMAND_TYPE = "policy/GETPOLICIES";

export interface GetPoliciesResponse {
  policies: PolicyModelGeneric[];
  total: number;
  page: number;
  limit: number;
}

export type GetPoliciesColumns = "id" | "resource" | "attribute";

export interface GetPoliciesCommandPayload {
  page: number;
  limit: number;
  filter: {
    [column in GetPoliciesColumns]: {
      [operator in FilterOperators]: string;
    };
  };
  order: {
    by: GetPoliciesColumns;
    type: "asc" | "desc";
  };
}

export class GetPoliciesCommand implements Command<GetPoliciesCommandPayload> {
  public type: string = GET_POLICIES_COMMAND_TYPE;

  constructor(public payload: GetPoliciesCommandPayload) {}
}
