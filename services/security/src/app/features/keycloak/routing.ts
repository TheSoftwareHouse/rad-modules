import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { addGroupAction, addGroupActionValidation } from "./actions/add-group.action";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { AdminPanelPoliciesConfig } from "../../../config/admin-panel-policies.config";
import { removeGroupAction, removeGroupActionValidation } from "./actions/remove-group.action";
import { addUserToGroupAction, addUserToGroupActionValidation } from "./actions/add-user-to-group.action";
import {
  removeUserFromGroupAction,
  removeUserFromGroupActionValidation,
} from "./actions/remove-user-from-group.action";
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
      requireAccess(adminPanelPolicies.removeKeycloakGroup.resource),
      removeGroupActionValidation,
    ],
    removeGroupAction({ commandBus }),
  );
  router.post(
    "/add-user-to-group",
    [
      featureIsActiveHandler,
      accessTokenHandler,
      requireAccess(adminPanelPolicies.removeUserFromKeycloakGroup.resource),
      addUserToGroupActionValidation,
    ],
    addUserToGroupAction({ commandBus }),
  );
  router.delete(
    "/remove-user-from-group",
    [removeUserFromGroupActionValidation],
    removeUserFromGroupAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
