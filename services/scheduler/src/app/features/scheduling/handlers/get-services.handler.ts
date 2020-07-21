import { Handler } from "../../../../../../../shared/command-bus";
import { GET_SERVICES_COMMAND_TYPE, GetServicesCommand } from "../commands/get-services.command";

export interface GetServicesHandlerProps {
  manifest: any[];
}

export default class GetServicesHandler implements Handler<GetServicesCommand> {
  constructor(private dependencies: GetServicesHandlerProps) {}

  public commandType: string = GET_SERVICES_COMMAND_TYPE;

  async execute(_command: GetServicesCommand) {
    return this.dependencies.manifest;
    // execute body
  }
}
