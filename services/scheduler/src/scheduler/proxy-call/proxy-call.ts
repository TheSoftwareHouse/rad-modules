import fetch from "node-fetch";
import { TransportProtocol } from "../../../../../shared/enums/transport-protocol";
import { buildRequestInit } from "./build-request-init";
import { buildApiUrl } from "./build-api-url";
import { Logger } from "winston";

type ServiceAction = {
  type: string;
  http: {
    uri: string;
    method: string;
  };
};

type ManifestService = {
  url: string;
  name: string;
  actions: ServiceAction[];
};

const httpStrategy = async (service: ManifestService, foundAction: ServiceAction, payload: any, logger: Logger) => {
  const response = await fetch(
    buildApiUrl(service.url, foundAction.http.uri, payload ? payload.queryParameters : undefined),
    buildRequestInit(
      foundAction.http.method,
      payload ? payload.body : undefined,
      payload ? payload.headers : undefined,
    ),
  );

  try {
    logger.info("response json:", await response.json());
  } catch (e) {
    logger.error("Failed to read json from response");
  }

  return response;
};

type ProxyCallProps = {
  manifest: ManifestService[];
  logger: Logger;
};

export type ProxyCall = (action: string, service: string, payload: any, strategy: TransportProtocol) => Promise<any>;

export const proxyCall = (dependencies: ProxyCallProps) => async (
  action: string,
  service: string,
  payload: any,
  strategy: TransportProtocol,
): Promise<any> => {
  const foundService = dependencies.manifest.find((s) => s.name === service);

  if (!foundService) {
    throw new Error(`Service ${service} doesn't exist.`);
  }

  const foundAction = foundService.actions.find((a) => a.type === action);

  if (!foundAction) {
    throw new Error(`Service ${service} has no action named ${action}`);
  }

  if (!foundAction.http) {
    throw new Error(`Action ${action} of service ${service} has no http section defined.`);
  }

  if (strategy === TransportProtocol.HTTP) {
    return httpStrategy(foundService, foundAction, payload, dependencies.logger);
  }

  throw new Error(`${strategy} is not a supported strategy.`);
};
