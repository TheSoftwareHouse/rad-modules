export interface SecurityAdapter {
  login: (username: string, password: string) => Promise<string>;
  verify: (token: string) => Promise<boolean>;
}
