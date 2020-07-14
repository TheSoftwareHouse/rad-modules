import * as express from "express";

export interface RoutingProps {
  pdfRouting: express.Router;
  downloadPdfRouting: express.Router;
  // ROUTES_INTERFACE
}

export const createRouter = ({
  pdfRouting,
  downloadPdfRouting,
  // ROUTES_DEPENDENCIES
}:
RoutingProps) => {
  const router = express.Router();

  router.use("/pdf", pdfRouting);
  router.use("/download-pdf", downloadPdfRouting);
  // ROUTES_CONFIG
  return router;
};
