import * as express from "express";
import { CommandBus } from "../../../../../../shared/command-bus";

import { downloadPdfAction, downloadPdfActionValidation } from "./actions/download-pdf.action";
// COMMAND_IMPORTS

export interface DownloadPdfRoutingProps {
  commandBus: CommandBus;
}

export const downloadPdfRouting = ({ commandBus }: DownloadPdfRoutingProps) => {
  const router = express.Router();

  router.get("/:fileId", [downloadPdfActionValidation], downloadPdfAction({ commandBus }));
  // COMMANDS_SETUP

  return router;
};
