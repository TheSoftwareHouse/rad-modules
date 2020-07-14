export interface TokensRepository {
  addRefreshToken: (userId: string, token: string) => Promise<void>;
  removeRefreshToken: (userId: string, token: string) => Promise<void>;
  removeAllRefreshTokens: (userId: string) => Promise<void>;
  belongsToUser: (userId: string, token: string) => Promise<boolean>;
}
