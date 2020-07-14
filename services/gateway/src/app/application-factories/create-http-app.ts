import { HttpApplication } from "../applications/http/http-application";
import * as express from "express";
import * as helmet from "helmet";
import * as cors from "cors";
import * as http from "http";
import { ErrorRequestHandler, RequestHandler } from "express";
import { Logger } from "winston";

type HttpAppDependencies = {
  app: express.Express;
  port: number;
  logger: Logger;
};

type createAppDependencies = {
  proxyManager: RequestHandler[];
  errorHandler: ErrorRequestHandler;
  requestLogger: RequestHandler;
};

export const createApp = (dependencies: createAppDependencies) => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  // app.use(express.json());

  app.use(dependencies.requestLogger);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "200 - ok",
    });
  });

  app.use(dependencies.proxyManager);

  app.use((req, res) => res.sendStatus(404));
  app.use(dependencies.errorHandler);

  return app;
};

export const createHttpApp = (dependencies: HttpAppDependencies) => {
  const { port, app, logger } = dependencies;

  const server = http.createServer(app);

  return new HttpApplication({ server, port, logger });
};
