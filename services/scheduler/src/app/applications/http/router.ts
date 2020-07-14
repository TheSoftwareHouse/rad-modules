import * as express from "express";

export interface RoutingProps {
  scheduleRouting: express.Router;
  // ROUTES_INTERFACE
}

export const createRouter = ({
  scheduleRouting,
}: // ROUTES_DEPENDENCIES
RoutingProps) => {
  const router = express.Router();

  router.use("/scheduling", scheduleRouting);
  // ROUTES_CONFIG
  return router;
};
