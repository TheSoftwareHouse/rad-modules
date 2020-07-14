import { GenericTransport, MailMessage } from "../mailer";
import fetch from "node-fetch";

export interface ExternalTransportProperties {
  mailerUrl: string;
}

export class ExternalTransport implements GenericTransport {
  constructor(private externalTransportProperties: ExternalTransportProperties) {}

  public async send(mailMessage: MailMessage): Promise<any> {
    const { mailerUrl } = this.externalTransportProperties;
    const response = await fetch(mailerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailMessage),
    });

    return response.json();
  }
}
