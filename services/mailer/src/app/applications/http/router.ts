import * as express from "express";

export interface RoutingProps {
  mailerRouting: express.Router;
// ROUTES_INTERFACE
}

export const createRouter = ({
  mailerRouting,
// ROUTES_DEPENDENCIES
}: 
RoutingProps) => {
  const router = express.Router();

  router.use("/mailer", mailerRouting);
  // ROUTES_CONFIG
  return router;
};
