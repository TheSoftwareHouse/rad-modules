import { JobOptions } from "../app/features/scheduling/models/job.model";

export type ObjectType = { [key: string]: string };

export enum JobType {
  HTTP = "http",
}

export enum HttpMethod {
  GET = "GET",
  HEAD = "HEAD",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  CONNECT = "CONNECT",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
  PATCH = "PATCH",
}

export type HttpPayload = {
  method?: HttpMethod;
  url: string;
  headers?: string[][] | ObjectType;
  body?: string | ObjectType | ObjectType[];
  options?: {
    compress?: boolean;
    follow?: number;
    size?: number;
    timeout?: number;
  };
};

export type JobDescription = {
  name: string;
  type: JobType;
  payload: HttpPayload;
  jobOptions: JobOptions;
  startImmediately: boolean;
};
