import { Command } from "@tshio/command-bus";
import { FilterOperators } from "../../../../repositories/helpers/query-filter";

export const GET_USERS_COMMAND_TYPE = "users/GETUSERS";

export type GetUserColumns = "id" | "username" | "isActive" | "createdAt" | "updatedAt" | "attribute.name";

export interface GetUsersCommandPayload {
  page: number;
  limit: number;
  filter: {
    [column in GetUserColumns]: {
      [operator in FilterOperators]: string;
    };
  };
  order: {
    by: GetUserColumns;
    type: "asc" | "desc";
  };
}

export class GetUsersCommand implements Command<GetUsersCommandPayload> {
  public type: string = GET_USERS_COMMAND_TYPE;

  constructor(public payload: GetUsersCommandPayload) {}
}
