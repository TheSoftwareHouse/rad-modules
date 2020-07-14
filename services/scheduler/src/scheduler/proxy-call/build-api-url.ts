import * as querystring from "querystring";

export const buildApiUrl = (serviceUrl: string, apiUrl: string, queryParameters?: { [key: string]: string }) => {
  const baseUri = serviceUrl + apiUrl;

  if (!queryParameters) {
    return baseUri;
  }

  return `${baseUri}?${querystring.stringify(queryParameters)}`;
};
