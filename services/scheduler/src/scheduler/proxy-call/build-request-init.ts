const contentTypeHeaders = { "Content-Type": "application/json" };

export const buildRequestInit = (method: string, body: any, headers?: { [key: string]: string }) => {
  return {
    method,
    body: JSON.stringify(body),
    headers: headers ? { ...contentTypeHeaders, ...headers } : contentTypeHeaders,
  };
};
