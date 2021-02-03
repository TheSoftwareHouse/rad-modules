import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { sendAction, sendActionValidation } from "./actions/send.action";
import { getNotificationsAction, getNotificationsActionValidation } from "./actions/get-notifications.action";
// COMMAND_IMPORTS

export interface NotificationsRoutingProps {
  commandBus: CommandBus;
}

export const notificationsRouting = ({ commandBus }: NotificationsRoutingProps) => {
  const router = express.Router();

  router.post("/send", [sendActionValidation], sendAction({ commandBus }));
  router.get("/get-notifications", [getNotificationsActionValidation], getNotificationsAction({ commandBus }));
  // COMMANDS_SETUP

  return router;
};
