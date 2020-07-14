import { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (req, res, _next) => {
  switch (req.headers["content-type"]) {
    case "application/json":
      return res.status(404).json({ error: "Not Found" });

    default:
      return res.sendStatus(404);
  }
};
