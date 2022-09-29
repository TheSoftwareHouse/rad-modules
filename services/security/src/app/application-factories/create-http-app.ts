import { HttpApplication } from "../applications/http/http-application";
import * as express from "express";
import helmet from "helmet";
import * as cors from "cors";
import * as http from "http";
import * as swaggerUi from "swagger-ui-express";
import jsdoc from "../applications/http/swagger";
import { ErrorRequestHandler, RequestHandler } from "express";
import { Logger } from "@tshio/logger";
import * as cookieParser from "cookie-parser";

type HttpAppDependencies = {
  app: express.Express;
  port: number;
  logger: Logger;
};

type createAppDependencies = {
  apiRouter: express.Router;
  errorHandler: ErrorRequestHandler;
  requestLogger: RequestHandler;
  notFoundHandler: RequestHandler;
};

export const createApp = (dependencies: createAppDependencies) => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json() as any);
  app.use(cookieParser());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "200 - ok",
    });
  });

  app.use(dependencies.requestLogger);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(jsdoc));
  app.get("/api-docs.json", (req, res) => res.json(jsdoc));
  app.use("/api", dependencies.apiRouter);
  app.use(dependencies.notFoundHandler);
  app.use(dependencies.errorHandler);

  return app;
};

export const createHttpApp = (dependencies: HttpAppDependencies) => {
  const { port, app, logger } = dependencies;

  const server = http.createServer(app);

  return new HttpApplication({ server, port, logger });
};
