import { Command } from "../../../../../../../shared/command-bus";
import { FilterOperators } from "../../../../../../security/src/repositories/helpers/query-filter";

export const GET_NOTIFICATIONS_COMMAND_TYPE = "notifications/GETNOTIFICATIONS";

export type GetNotificationsColumns = "id" | "channel" | "message" | "createdAt" | "updatedAt";

export interface GetNotificationsCommandPayload {
  page: number;
  limit: number;
  filter: {
    [column in GetNotificationsColumns]: {
      [operator in FilterOperators]: string;
    };
  };
  order: {
    by: GetNotificationsColumns;
    type: "asc" | "desc";
  };
}

export class GetNotificationsCommand implements Command<GetNotificationsCommandPayload> {
  public type: string = GET_NOTIFICATIONS_COMMAND_TYPE;

  constructor(public payload: GetNotificationsCommandPayload) {}
}
