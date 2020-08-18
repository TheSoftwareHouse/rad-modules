import { CommandBus } from "../../../../../../shared/command-bus";
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { loginAction, loginActionValidation } from "./actions/login.action";
import { addUserAction, addUserActionValidation } from "./actions/add-user.action";
import { isAuthenticatedAction } from "./actions/is-authenticated.action";
import { refreshTokenAction, refreshTokenActionValidation } from "./actions/refresh-token.action";
import { hasAttributeAction, hasAttributeActionValidation } from "./actions/has-attribute.action";
import { addAttributeAction, addAttributeActionValidation } from "./actions/add-attribute.action";
import { hasAccessAction, hasAccessActionValidation } from "./actions/has-access.action";
import { removeAttributeAction, removeAttributeActionValidation } from "./actions/remove-attribute.action";
import { oauthRedirectAction, oauthRedirectActionDefaultValidation } from "./actions/oauth-redirect.action";
import { resetPasswordAction, resetPasswordActionValidation } from "./actions/reset-password.action";
import { activateUserAction, activateUserActionValidation } from "./actions/activate-user.action";
import { deactivateUserAction, deactivateUserActionValidation } from "./actions/deactivate-user.action";
import {
  refreshUserActiveTokenAction,
  refreshUserActiveTokenActionValidation,
} from "./actions/refresh-user-active-token.action";
import { AdminPanelPoliciesConfig, OauthProvider } from "../../../config/config";
import { RequireAccessFactory } from "../../../middleware/require-access";
import { deleteUserAction, deleteUserActionValidation } from "./actions/delete-user.action";
import { getUserIdAction, getUserIdActionValidation } from "./actions/get-user-id.action";
import { getUsersAction, getUsersActionValidation } from "./actions/get-users.action";
import { UsersRepository } from "../../../repositories/users.repostiory";
import { setPasswordAction, setPasswordActionValidation } from "./actions/set-password.action";
import { JwtUtils } from "../../../tokens/jwt-utils";
import { passwordResetTokenAction, passwordResetTokenActionValidation } from "./actions/password-reset-token.action";
import { getUserAction, getUserActionValidation } from "./actions/get-user.action";
import { getUsersByResourceAction, getUsersByResourceActionValidation } from "./actions/get-users-by-resource.action";
import { AuthorizationClient } from "../../../ACL/authorization-client.types";
// COMMAND_IMPORTS

export interface UsersRoutingProps {
  commandBus: CommandBus;
  requireAccess: RequireAccessFactory;
  adminPanelPolicies: AdminPanelPoliciesConfig;
  usersRepository: UsersRepository;
  jwtUtils: JwtUtils;
  authorizationClient: AuthorizationClient;
  accessTokenHandler: express.RequestHandler;
  xApiKeyHandler: express.RequestHandler;
}

// eslint-disable-next-line
export const usersRouting = ({
  commandBus,
  requireAccess,
  adminPanelPolicies,
  usersRepository,
  jwtUtils,
  authorizationClient,
  accessTokenHandler,
  xApiKeyHandler,
}: UsersRoutingProps) => {
  const router = express.Router();
  router.post("/login", [loginActionValidation], loginAction({ commandBus }));
  router.post(
    "/add-user",
    [accessTokenHandler, requireAccess(adminPanelPolicies.addUser.resource), addUserActionValidation],
    addUserAction({ commandBus }),
  );
  router.get("/is-authenticated", [accessTokenHandler, xApiKeyHandler], isAuthenticatedAction({ commandBus }));
  router.post("/refresh-token", [refreshTokenActionValidation], refreshTokenAction({ commandBus }));
  router.post("/has-attributes", [hasAttributeActionValidation, xApiKeyHandler], hasAttributeAction({ commandBus }));
  router.post(
    "/add-attribute",
    [accessTokenHandler, requireAccess(adminPanelPolicies.addAttributeToUser.resource), addAttributeActionValidation],
    addAttributeAction({ commandBus }),
  );
  router.post("/has-access", [hasAccessActionValidation, xApiKeyHandler], hasAccessAction({ commandBus }));
  router.get(
    "/",
    [accessTokenHandler, requireAccess(adminPanelPolicies.getUsers.resource), getUsersActionValidation],
    getUsersAction({ commandBus }),
  );
  router.delete(
    "/remove-attribute",
    [
      accessTokenHandler,
      requireAccess(adminPanelPolicies.removeAttributeToUser.resource),
      removeAttributeActionValidation,
    ],
    removeAttributeAction({ commandBus }),
  );

  router.get(
    ["/oauth-redirect", "/oauth-redirect/:provider"],
    [
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.params.provider) {
          req.params.provider = OauthProvider.GOOGLE;
        }
        next();
      },
      oauthRedirectActionDefaultValidation,
    ],
    oauthRedirectAction({ commandBus }),
  );

  router.post(
    "/reset-password/:resetPasswordToken",
    [resetPasswordActionValidation],
    resetPasswordAction({ commandBus }),
  );
  router.post("/activate-user/:activationToken", [activateUserActionValidation], activateUserAction({ commandBus }));
  router.post(
    "/deactivate-user",
    [accessTokenHandler, requireAccess(adminPanelPolicies.deactivateUser.resource), deactivateUserActionValidation],
    deactivateUserAction({ commandBus }),
  );
  router.post(
    "/refresh-user-active-token",
    [
      accessTokenHandler,
      requireAccess(adminPanelPolicies.deactivateUser.resource),
      refreshUserActiveTokenActionValidation,
    ],
    refreshUserActiveTokenAction({ commandBus }),
  );
  router.delete(
    "/delete-user",
    [accessTokenHandler, requireAccess(adminPanelPolicies.deleteUser.resource), deleteUserActionValidation],
    deleteUserAction({ commandBus }),
  );
  router.get(
    "/get-user-id",
    [accessTokenHandler, requireAccess(adminPanelPolicies.getUserId.resource), getUserIdActionValidation],
    getUserIdAction({ usersRepository }),
  );
  router.post(
    "/set-password",
    [setPasswordActionValidation, accessTokenHandler],
    setPasswordAction({ commandBus, jwtUtils, authorizationClient }),
  );
  router.post(
    "/password-reset-token",
    [passwordResetTokenActionValidation, accessTokenHandler, requireAccess(adminPanelPolicies.resetPassword.resource)],
    passwordResetTokenAction({ commandBus }),
  );
  router.get(
    "/get-user/:userId",
    [accessTokenHandler, requireAccess(adminPanelPolicies.getUser.resource), getUserActionValidation],
    getUserAction({ commandBus, authorizationClient }),
  );
  router.get(
    "/get-users-by-resource",
    [
      accessTokenHandler,
      requireAccess(adminPanelPolicies.getUsersByResource.resource),
      getUsersByResourceActionValidation,
    ],
    getUsersByResourceAction({ commandBus }),
  );
  // COMMANDS_SETUP

  return router;
};
