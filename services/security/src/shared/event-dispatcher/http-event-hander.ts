import fetch from "node-fetch";
import { Event } from "./index";
import { Logger } from "winston";
import { Joi } from "celebrate";

export type EventHandler = (event: Event) => Promise<any>;

export const httpEventHandler = ({
  logger,
  eventDispatcherCallbackUrls,
}: {
  logger: Logger;
  eventDispatcherCallbackUrls: string[];
}) => async (event: Event) => {
  const uriSchema = Joi.string().uri();
  const handlers = eventDispatcherCallbackUrls
    .filter((url) => {
      const { error } = uriSchema.validate(url);
      return error === undefined;
    })
    .map(async (url) => {
      fetch(url, {
        method: "post",
        body: JSON.stringify({ event: event.name, payload: event.payload }),
      })
        .then((response) => {
          logger.info(`HttpEventHandler executed on url=${url}, status=${response.status}`);
        })
        .catch((err) => {
          logger.info(`HttpEventHandler error on url=${url}, error=${err}`);
        });
    });
  await Promise.all(handlers);
};
