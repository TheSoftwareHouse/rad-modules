import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { sendAction, sendActionValidation } from "./actions/send.action";
// COMMAND_IMPORTS

export interface MailerRoutingProps {
  commandBus: CommandBus;
}

export const mailerRouting = ({ commandBus }: MailerRoutingProps) => {
  const router = express.Router();

  router.post("/send", [sendActionValidation], sendAction({ commandBus }));
  // COMMANDS_SETUP

  return router;
};
