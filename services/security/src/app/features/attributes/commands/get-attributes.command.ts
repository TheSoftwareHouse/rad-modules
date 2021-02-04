import { Command } from "@tshio/command-bus";

export const GET_ATTRIBUTES_COMMAND_TYPE = "attributes/GETATTRIBUTES";

export interface GetAttributesCommandPayload {
  page: number;
  limit: number;
  filter: {
    [key: string]: object;
  };
  order: {
    by: string;
    type: "asc" | "desc";
  };
}

export class GetAttributesCommand implements Command<GetAttributesCommandPayload> {
  public type: string = GET_ATTRIBUTES_COMMAND_TYPE;

  constructor(public payload: GetAttributesCommandPayload) {}
}
