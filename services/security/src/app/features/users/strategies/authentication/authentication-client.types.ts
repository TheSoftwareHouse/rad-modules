type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export interface AuthenticationClient {
  login: (username?: string, password?: string, code?: string) => Promise<Tokens>;
  loginWithoutPassword: (username: string) => Promise<Tokens>;
  resetPassword: (userName: string, newPassword: string) => Promise<void>;
  setNewPassword: (userName: string, oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: (accessToken: string) => Promise<boolean>;
  refreshToken: (accessToken: string, refreshToken: string) => Promise<Tokens>;
}
