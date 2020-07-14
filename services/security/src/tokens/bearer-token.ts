import { UnathorizedError } from "../errors/unathorized.error";

export class BearerToken {
  static fromCookieOrString(token?: string) {
    if (!token) {
      throw new UnathorizedError("Token missing or invalid token format");
    }

    return new BearerToken(token);
  }

  static fromHeader(token?: string) {
    const regex = /^(Bearer) ([^\s]+)$/;

    if (!token || !regex.test(token)) {
      throw new UnathorizedError("Token missing or invalid token format");
    }

    const match = token.match(regex);

    if (match && match.length === 3) {
      // eslint-disable-next-line
      return new BearerToken(match[2]);
    }

    throw new UnathorizedError("Invalid token format");
  }

  private constructor(private token: string) {}

  public getToken() {
    return this.token;
  }
}
