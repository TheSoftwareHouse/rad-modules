import { GenericTransport, MailMessage } from "../mail-sender";
import { send as sendMail, setApiKey } from "@sendgrid/mail";

export interface SendGridTransportConfig {
  authKey: string;
}

export class SendGridTransport implements GenericTransport {
  constructor(private properties: SendGridTransportConfig) {
    setApiKey(properties.authKey);
  }

  public send(mailMessages: MailMessage[]): Promise<any[]> {
    const mailsToSend = mailMessages.map(async (message) => {
      return sendMail({
        from: message.sender,
        templateId: message.template.id,
        to: message.recipient.to.join(", "),
        cc: message.recipient.cc === undefined ? "" : message.recipient.cc.join(", "),
        bcc: message.recipient.bcc === undefined ? "" : message.recipient.bcc.join(", "),
        attachments: message.attachments === undefined ? [] : message.attachments,
        dynamicTemplateData: message.template.parameters,
        mailSettings: {
          sandboxMode: {
            enable: process.env.NODE_ENV !== "production",
          },
        },
      } as any);
    });
    return Promise.all(mailsToSend);
  }
}
