import { Handler } from "../../../../../../../shared/command-bus";
import { GET_SERVICES_COMMAND_TYPE, GetServicesCommand } from "../commands/get-services.command";
import { ManifestService, ManifestServiceAction } from "../../../../scheduler";

export interface GetServicesHandlerProps {
  manifest: ManifestService[];
}

export default class GetServicesHandler implements Handler<GetServicesCommand> {
  constructor(private dependencies: GetServicesHandlerProps) {}

  public commandType: string = GET_SERVICES_COMMAND_TYPE;

  async execute(_command: GetServicesCommand) {
    return this.dependencies.manifest.map((entry) => {
      return {
        service: entry.name,
        actions: entry.actions.map((action: ManifestServiceAction) => {
          return action.type;
        }),
      };
    });
  }
}
