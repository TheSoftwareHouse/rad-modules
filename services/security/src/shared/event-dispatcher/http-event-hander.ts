import { Event } from "./index";
import { Logger } from "winston";
import { Joi } from "celebrate";

export type EventHandler = (event: Event) => Promise<any>;

export const httpEventHandler = ({
  logger,
  eventDispatcherCallbackUrls,
  myFetch,
}: {
  logger: Logger;
  eventDispatcherCallbackUrls: string[];
  myFetch: (url: string, opts: {}) => Promise<any>;
}) => async (event: Event) => {
  const uriSchema = Joi.string().uri();
  const handlers = eventDispatcherCallbackUrls
    .filter((url) => {
      const { error } = uriSchema.validate(url);
      return error === undefined;
    })
    .map(async (url) => {
      // eslint-disable-next-line no-console
      console.log(`fetching from ${url}...`);
      await myFetch(url, {
        method: "post",
        body: JSON.stringify({ event: event.name, payload: event.payload }),
      })
        .then((response) => {
          // eslint-disable-next-line no-console
          console.log(`got response: ${response.status}`);
          logger.info(`HttpEventHandler executed on url=${url}, status=${response.status}`);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(`got error:${err}`);
          logger.info(`HttpEventHandler error on url=${url}, error=${err}`);
        });
    });
  // eslint-disable-next-line no-console
  console.log("after map");
  await Promise.all(handlers);
  // eslint-disable-next-line no-console
  console.log("before return");
};
