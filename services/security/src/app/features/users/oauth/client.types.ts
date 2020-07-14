export type OAuthUser = {
  email: string;
};

export type OAuthDefaultLogin = {
  code: string;
  redirectUrl: string;
};

export type OAuthGoogleIdTokenLogin = {
  idToken: string;
};

export type OAuthLogin = OAuthDefaultLogin;
export type OAuthLoginIdToken = OAuthGoogleIdTokenLogin;

export interface OAuthClient {
  login: (oauthLogin: OAuthLogin) => Promise<OAuthUser>;
  loginWithToken: (oauthLoginIdToken: OAuthLoginIdToken) => Promise<OAuthUser>;
}
