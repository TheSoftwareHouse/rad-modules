import * as express from "express";
import { CommandBus } from "../../../../../../shared/command-bus";
import { createAccessKeyAction, createAccessKeyActionValidation } from "./actions/create-access-key.action";

import { generateTokenAction, generateTokenActionValidation } from "./actions/generate-token.action";
import { removeAccessKeyAction, removeAccessKeyActionValidation } from "./actions/remove-access-key.action";
import { AdminPanelPoliciesConfig } from "../../../config/config";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { getAccessKeysAction, getAccessKeysActionValidation } from "./actions/get-access-keys.action";
// COMMAND_IMPORTS

export interface TokensRoutingProps {
  commandBus: CommandBus;
  adminPanelPolicies: AdminPanelPoliciesConfig;
  requireAccess: RequireAccessFactory;
  accessTokenHandler: express.RequestHandler;
}

export const tokensRouting = ({
  commandBus,
  adminPanelPolicies,
  requireAccess,
  accessTokenHandler,
}: TokensRoutingProps) => {
  const router = express.Router();

  router.post(
    "/create-access-key",
    [accessTokenHandler, createAccessKeyActionValidation, requireAccess(adminPanelPolicies.createAccessKey.resource)],
    createAccessKeyAction({ commandBus }),
  );
  router.post("/generate-token", [generateTokenActionValidation], generateTokenAction({ commandBus }));
  router.delete(
    "/remove-access-key/:apiKey",
    [accessTokenHandler, removeAccessKeyActionValidation, requireAccess(adminPanelPolicies.removeAccessKey.resource)],
    removeAccessKeyAction({ commandBus }),
  );
  router.get(
    "/get-access-keys",
    [accessTokenHandler, getAccessKeysActionValidation, requireAccess(adminPanelPolicies.getAccessKeys.resource)],
    getAccessKeysAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
