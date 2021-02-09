import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { addGroupAction, addGroupActionValidation } from "./actions/add-group.action";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { AdminPanelPoliciesConfig } from "../../../config/admin-panel-policies.config";
import { removeGroupAction, removeGroupActionValidation } from "./actions/remove-group.action";
// COMMAND_IMPORTS

export interface KeycloakRoutingProps {
  commandBus: CommandBus;
  requireAccess: RequireAccessFactory;
  accessTokenHandler: express.RequestHandler;
  featureIsActiveHandler: express.RequestHandler;
  adminPanelPolicies: AdminPanelPoliciesConfig;
}

export const keycloakRouting = ({
  commandBus,
  requireAccess,
  accessTokenHandler,
  adminPanelPolicies,
  featureIsActiveHandler,
}: KeycloakRoutingProps) => {
  const router = express.Router();

  router.post(
    "/add-group",
    [
      featureIsActiveHandler,
      accessTokenHandler,
      requireAccess(adminPanelPolicies.addKeycloakGroup.resource),
      addGroupActionValidation,
    ],
    addGroupAction({ commandBus }),
  );
  router.delete(
    "/remove-group",
    [
      featureIsActiveHandler,
      accessTokenHandler,
      requireAccess(adminPanelPolicies.addKeycloakGroup.resource),
      removeGroupActionValidation,
    ],
    removeGroupAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
