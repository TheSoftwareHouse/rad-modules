import { Command } from "../../../../../../../shared/command-bus";

export const GET_SERVICES_COMMAND_TYPE = "scheduling/GETSERVICES";

export interface GetServicesCommandPayload {}

export class GetServicesCommand implements Command<GetServicesCommandPayload> {
  public type: string = GET_SERVICES_COMMAND_TYPE;

  constructor(public payload: GetServicesCommandPayload) {}
}
