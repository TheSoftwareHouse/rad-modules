import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { createHttpApp } from "./application-factories/create-http-app";

export class ApplicationFactory {
  public getApplicationBuilder(type: TransportProtocol) {
    if (type === TransportProtocol.HTTP) {
      return createHttpApp;
    }

    throw new Error(`Application type ${type} not supported. Cannot start the service.`);
  }
}
