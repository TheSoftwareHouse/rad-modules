export enum TokenType {
  USER = "user",
  CUSTOM = "custom",
}

export type JwtPayload = {
  type: TokenType;
  userId: string;
  username?: string;
  attributes?: string[];
  policy?: string[];
  accessExpirationInSeconds?: number;
  refreshExpirationInSeconds?: number;
};
