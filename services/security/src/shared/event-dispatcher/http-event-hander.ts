import fetch from "node-fetch";
import { Event } from "./index";
import { Logger } from "winston";

export type EventHandler = (event: Event) => Promise<any>;

export const httpEventHandler = ({
  logger,
  eventDispatcherCallbackUrl,
}: {
  logger: Logger;
  eventDispatcherCallbackUrl: string;
}) => async (event: Event) => {
  if (eventDispatcherCallbackUrl) {
    const response = await fetch(eventDispatcherCallbackUrl, {
      method: "post",
      body: JSON.stringify({ event: event.name, payload: event.payload }),
    });
    logger.info(`HttpEventHandler executed, status=${response.status}`);
  }
};
