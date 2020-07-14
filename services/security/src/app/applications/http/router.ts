import * as express from "express";

export interface RoutingProps {
  usersRouting: express.Router;
  publicRouting: express.Router;
  policyRouting: express.Router;
  tokensRouting: express.Router;
  attributesRouting: express.Router;
  // ROUTES_INTERFACE
}

export const createApiRouter = ({
  usersRouting,
  publicRouting,
  policyRouting,
  tokensRouting,
  attributesRouting,
  // ROUTES_DEPENDENCIES
}: RoutingProps,
) => {
  const router = express.Router();

  router.use("/public", publicRouting);
  router.use("/users", usersRouting);
  router.use("/policy", policyRouting);
  router.use("/tokens", tokensRouting);
  router.use("/attributes", attributesRouting);
  // ROUTES_CONFIG
  return router;
};

