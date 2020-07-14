import { GenericTransport, MailMessage } from "../mailer";

export class NoneTransport implements GenericTransport {
  public async send(mailMessage: MailMessage): Promise<any> {
    return Promise.resolve(mailMessage);
  }
}
