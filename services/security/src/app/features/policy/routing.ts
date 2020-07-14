import * as express from "express";
import { addPolicyActionValidation, addPolicyAction } from "./actions/add-policy.action";
import { CommandBus } from "../../../../../../shared/command-bus";
import { AdminPanelPoliciesConfig } from "../../../config/config";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { removePolicyAction, removePolicyActionValidation } from "./actions/remove-policy.action";
import { getPoliciesActionValidation, getPoliciesAction } from "./actions/get-policies.action";
import { PolicyRepository } from "../../../repositories/policy.repository";
// COMMAND_IMPORTS

export interface UsersRoutingProps {
  commandBus: CommandBus;
  requireAccess: RequireAccessFactory;
  adminPanelPolicies: AdminPanelPoliciesConfig;
  accessTokenHandler: express.RequestHandler;
  policyRepository: PolicyRepository;
}

// eslint-disable-next-line
export const policyRouting = ({
  commandBus,
  requireAccess,
  adminPanelPolicies,
  accessTokenHandler,
}: UsersRoutingProps) => {
  const router = express.Router();

  router.post(
    "/add-policy",
    [accessTokenHandler, requireAccess(adminPanelPolicies.addPolicies.resource), addPolicyActionValidation],
    addPolicyAction({ commandBus }),
  );
  router.delete(
    "/remove-policy",
    [accessTokenHandler, requireAccess(adminPanelPolicies.removePolicies.resource), removePolicyActionValidation],
    removePolicyAction({ commandBus }),
  );
  router.get(
    "/get-policies",
    [accessTokenHandler, requireAccess(adminPanelPolicies.getPolicies.resource), getPoliciesActionValidation],
    getPoliciesAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
