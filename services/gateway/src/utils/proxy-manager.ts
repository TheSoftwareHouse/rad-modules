import { RequestHandler } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { FORBIDDEN } from "http-status-codes";
import fetch from "node-fetch";
import { HttpError } from "../errors/http.error";

function hasAccess(hasAccessEndpointUrl: string, headers: any, resource: string | undefined): Promise<boolean> {
  return fetch(`${hasAccessEndpointUrl}?resource=${resource}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: headers.authorization,
    },
    body: JSON.stringify({ resources: [resource] }),
  }).then(async (response) => {
    const data = await response.json();
    if (response.status >= 400) {
      throw new HttpError(data.error, response.status);
    }
    return data.hasAccess;
  });
}

export interface ProxyRoute extends Options {
  path: string;
  target?: string;
  isPublic: boolean;
  method?: string;
  resource?: string;
}

function createProxyRoute(hasAccessEndpointUrl: string, options: ProxyRoute): RequestHandler {
  const filter = (pathname: any, req: any) =>
    pathname.match(options.path) && (!options.method || options.method === req.method);
  return createProxyMiddleware(filter, {
    ...options,
    onProxyReq: (proxyReq, req, res) => {
      if (!options.isPublic) {
        proxyReq!.socket!.pause();
        hasAccess(hasAccessEndpointUrl, proxyReq.getHeaders(), options.resource)
          .then((access) => {
            if (!access) {
              res.status(FORBIDDEN).json({
                error: "User has no access",
              });
            }
          })
          .catch((error) => res.status(error.code ?? 500).json({ error: error.message }))
          .finally(() => proxyReq!.socket!.resume());
      }
    },
  });
}

export interface ProxyManagerDependencies {
  hasAccessEndpointUrl: string;
  proxyManagerConfig: any[];
}

export function proxyManager(dependencies: ProxyManagerDependencies) {
  const { hasAccessEndpointUrl, proxyManagerConfig } = dependencies;

  return proxyManagerConfig.map((node) => createProxyRoute(hasAccessEndpointUrl, node));
}
