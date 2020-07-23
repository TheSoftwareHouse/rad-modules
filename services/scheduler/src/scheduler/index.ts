export type ManifestServiceAction = {
  type: string;
  http: {
    uri: string;
    method: string;
  };
};

export type ManifestService = {
  url: string;
  name: string;
  actions: ManifestServiceAction[];
};
