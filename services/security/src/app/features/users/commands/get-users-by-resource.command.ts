import { Command } from "@tshio/command-bus";

export const GET_USERS_BY_RESOURCE_COMMAND_TYPE = "users/GETUSERSBYRESOURCE";

export interface GetUsersByResourceCommandPayload {
  page: number;
  limit: number;
  resourceName: string;
}

export class GetUsersByResourceCommand implements Command<GetUsersByResourceCommandPayload> {
  public type: string = GET_USERS_BY_RESOURCE_COMMAND_TYPE;

  constructor(public payload: GetUsersByResourceCommandPayload) {}
}
