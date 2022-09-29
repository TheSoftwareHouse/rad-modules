import * as assert from "assert";

const deepEqualOmit =
  (bodyObject: any, keysToOmit: string[] = ["stack"]) =>
  (response: any) => {
    const objectWithKeysToOmit = keysToOmit?.reduce((acc: any, current: string) => {
      acc[current] = undefined;
      return acc;
    }, {});

    assert.deepStrictEqual({ ...response.body, ...objectWithKeysToOmit }, { ...bodyObject, ...objectWithKeysToOmit });

    return response;
  };

const isUuid = (value: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

const isValidTokenType = (value: string) => value === "custom" || value === "user";

const isNotEmptyString = (value: string | null | undefined) => typeof value === "string" && value !== "";

const isDate = (value: Date | null | undefined) => value instanceof Date;

export { deepEqualOmit, isUuid, isValidTokenType, isNotEmptyString, isDate };
