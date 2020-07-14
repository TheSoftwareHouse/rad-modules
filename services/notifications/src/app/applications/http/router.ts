import * as express from "express";

export interface RoutingProps {
  notificationsRouting: express.Router;
  // ROUTES_INTERFACE
}

export const createRouter = ({
  notificationsRouting,
  // ROUTES_DEPENDENCIES
}:
RoutingProps) => {
  const router = express.Router();

  router.use("/notifications", notificationsRouting);
  // ROUTES_CONFIG
  return router;
};
