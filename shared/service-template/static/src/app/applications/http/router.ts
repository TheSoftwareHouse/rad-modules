import * as express from "express";

export interface RoutingProps {
  // ROUTES_INTERFACE
}

export const createRouter = ({
  // ROUTES_DEPENDENCIES
}:
RoutingProps) => {
  const router = express.Router();

  // ROUTES_CONFIG
  return router;
};
