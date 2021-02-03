import * as express from "express";
import { CommandBus } from "@tshio/command-bus";

import { createPdfAction, createPdfActionValidation } from "./actions/create-pdf.action";
import { AppConfig } from "../../../config/config";
// COMMAND_IMPORTS

export interface PdfRoutingProps {
  commandBus: CommandBus;
  config: AppConfig;
}

export const pdfRouting = ({ commandBus, config }: PdfRoutingProps) => {
  const router = express.Router();

  router.post("/create-pdf", [createPdfActionValidation], createPdfAction({ commandBus, config }));
  // COMMANDS_SETUP

  return router;
};
