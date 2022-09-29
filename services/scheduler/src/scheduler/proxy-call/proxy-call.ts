import fetch from "node-fetch";
import { SchedulerJob } from "../producer/scheduler.types";
import { JobType } from "../index";

const httpStrategy = async (data: SchedulerJob) => {
  const { url, method, body, headers, options } = data.payload;

  return fetch(url, { method, body, headers, ...options }).then(async (response) => {
    const responseText = await response.text();

    const responseJson = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText ?? "",
      url: response.url,
      headers: response.headers,
      redirected: response.redirected,
      response: responseText,
    };

    if (!responseJson.success) {
      throw new Error(JSON.stringify(responseJson));
    }

    return JSON.stringify(responseJson);
  });
};

export type ProxyCall = (job: SchedulerJob) => Promise<any>;

export const proxyCall =
  () =>
  async (job: SchedulerJob): Promise<any> => {
    switch (job.type) {
      case JobType.HTTP:
        return httpStrategy(job);
      default:
        throw new Error(`${job.type} is not a supported strategy.`);
    }
  };
