import * as crypto from "crypto";

type HashingAlgorithm = (password: string, salt: string) => string;

export const generateRandomString = (length: number) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

export const hashWithSha512 = (value: string, salt: string) => {
  const hash = crypto.createHmac("sha512", salt);
  hash.update(value);
  return hash.digest("hex");
};

export const hashWithSha1 = (value: string, salt: string) => {
  const hash = crypto.createHmac("sha1", salt);
  hash.update(value);
  return hash.digest("hex");
};

export const hashValue = (value: string, hashingAlgorithm: HashingAlgorithm) => {
  const salt = generateRandomString(16);

  return {
    hash: hashingAlgorithm(value, salt),
    salt,
  };
};
