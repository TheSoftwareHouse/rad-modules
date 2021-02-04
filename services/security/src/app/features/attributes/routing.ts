import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { getAttributesAction, getAttributesActionValidation } from "./actions/get-attributes.action";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { AdminPanelPoliciesConfig } from "../../../config/config";
// COMMAND_IMPORTS

export interface AttributesRoutingProps {
  commandBus: CommandBus;
  requireAccess: RequireAccessFactory;
  accessTokenHandler: express.RequestHandler;
  adminPanelPolicies: AdminPanelPoliciesConfig;
}

export const attributesRouting = ({
  commandBus,
  accessTokenHandler,
  requireAccess,
  adminPanelPolicies,
}: AttributesRoutingProps) => {
  const router = express.Router();

  router.get(
    "/",
    [accessTokenHandler, requireAccess(adminPanelPolicies.getAttributes.resource), getAttributesActionValidation],
    getAttributesAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
