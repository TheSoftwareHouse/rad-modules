import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { errorHandler } from "../middleware/error-handler";
import { notFoundHandler } from "../middleware/not-found-handler";
import { featureIsActiveHandler } from "../middleware/feature-is-active";

export async function registerMiddlewares(container: AwilixContainer) {
  container.register({
    errorHandler: awilix.asValue(errorHandler),
    notFoundHandler: awilix.asValue(notFoundHandler),
    featureIsActiveHandler: awilix.asValue(featureIsActiveHandler),
  });

  return container;
}
