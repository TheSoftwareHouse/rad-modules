import { HttpApplication } from "../applications/http/http-application";
import * as express from "express";
import * as helmet from "helmet";
import * as cors from "cors";
import * as http from "http";
import { ErrorRequestHandler, RequestHandler } from "express";
import * as swaggerUi from "swagger-ui-express";
import jsdoc from "../applications/http/swagger";
import { Logger } from "@tshio/logger";

type HttpAppDependencies = {
  app: express.Express;
  port: number;
  logger: Logger;
};

type createAppDependencies = {
  router: express.Router;
  errorHandler: ErrorRequestHandler;
  requestLogger: RequestHandler;
};

export const createApp = (dependencies: createAppDependencies) => {
  const app = express();

  app.use(cors() as RequestHandler);
  app.use(helmet());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "200 - ok",
    });
  });

  app.use(dependencies.requestLogger);
  app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(jsdoc) as any);
  app.use("/api", dependencies.router);
  app.use((req, res) => res.sendStatus(404));
  app.use(dependencies.errorHandler);

  return app;
};

export const createHttpApp = (dependencies: HttpAppDependencies) => {
  const { port, app, logger } = dependencies;

  const server = http.createServer(app);

  return new HttpApplication({ server, port, logger });
};
