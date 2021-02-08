import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { errorHandler } from "../middleware/error-handler";
import { notFoundHandler } from "../middleware/not-found-handler";

export async function registerMiddlewares(container: AwilixContainer) {
  container.register({
    errorHandler: awilix.asValue(errorHandler),
    notFoundHandler: awilix.asValue(notFoundHandler),
  });

  return container;
}
