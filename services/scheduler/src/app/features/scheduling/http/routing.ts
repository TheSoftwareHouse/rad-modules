import { CommandBus } from "@tshio/command-bus";
import * as express from "express";

import { scheduleJobAction, scheduleJobActionValidation } from "../actions/schedule-job.action";
import { cancelJobAction, cancelJobActionValidation } from "../actions/cancel-job.action";
import { getJobsAction, getJobsActionValidation } from "../actions/get-jobs.action";
// COMMAND_IMPORTS

export interface UsersRoutingProps {
  commandBus: CommandBus;
}

// eslint-disable-next-line
export const scheduleRouting = ({ commandBus }: UsersRoutingProps) => {
  const router = express.Router();

  router.post("/schedule-job", [scheduleJobActionValidation], scheduleJobAction({ commandBus }));
  router.delete("/cancel-job", [cancelJobActionValidation], cancelJobAction({ commandBus }));
  router.get("/get-jobs", [getJobsActionValidation], getJobsAction({ commandBus }));
  // COMMANDS_SETUP

  return router;
};
