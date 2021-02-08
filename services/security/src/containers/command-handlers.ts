import { AwilixContainer, Lifetime } from "awilix";
import * as awilix from "awilix";

export async function registerCommandHandlers(container: AwilixContainer) {
  const HANDLER_REGEX = /.+Handler$/;
  const handlersScope = container.createScope();

  handlersScope.loadModules(["src/**/*.handler.ts", "src/**/*.handler.js"], {
    formatName: "camelCase",
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      register: awilix.asClass,
    },
  });

  const handlers = Object.keys(handlersScope.registrations)
    .filter((key) => key.match(HANDLER_REGEX))
    .map((key) => handlersScope.resolve(key));

  container.register({
    commandHandlers: awilix.asValue(handlers),
  });

  return container;
}
