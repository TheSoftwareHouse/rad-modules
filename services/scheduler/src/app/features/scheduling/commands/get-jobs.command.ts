import { Command } from "@tshio/command-bus";
import { FilterOperators } from "../../../../../../security/src/repositories/helpers/query-filter";

export const GET_JOBS_COMMAND_TYPE = "scheduling/GETJOBS";

export type GetJobsColumns = "id" | "name" | "service" | "action" | "status" | "createdAt" | "updatedAt";

export interface GetJobsCommandPayload {
  page: number;
  limit: number;
  filter: {
    [column in GetJobsColumns]: {
      [operator in FilterOperators]: string;
    };
  };
  order: {
    by: GetJobsColumns;
    type: "asc" | "desc";
  };
}

export class GetJobsCommand implements Command<GetJobsCommandPayload> {
  public type: string = GET_JOBS_COMMAND_TYPE;

  constructor(public payload: GetJobsCommandPayload) {}
}
