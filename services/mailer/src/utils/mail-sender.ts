import { SmtpTransport, SmtpTransportConfig } from "./transports/smtp-transport";
import { SendGridTransport, SendGridTransportConfig } from "./transports/sendgrid-transport";

export type Sender = {
  name: string;
  email: string;
};

export type Recipient = {
  to: string[];
  cc?: string[];
  bcc?: string[];
};

export type Template = {
  id: string;
  parameters: {
    [key: string]: any;
  };
};

export type Attachment = {
  fileName: string;
  content: string;
};

export interface MailMessage {
  sender: Sender;
  recipient: Recipient;
  template: Template;
  attachments?: Attachment[];
}

export enum TransportType {
  SMTP = "smtp",
  SENDGRID = "sendgrid",
}

export interface GenericTransport {
  send(mailMessage: MailMessage[]): Promise<any[]>;
}

export interface MailerConfig {
  type: TransportType;
  smtpConfig?: SmtpTransportConfig;
  sendGridConfig?: SendGridTransportConfig;
  batch: {
    size: number;
    period: number;
    retryAfter: number;
    lockTriggerDelay: number;
  };
}

export interface MailSenderProperties extends MailerConfig {}

export class MailSender {
  private sender: GenericTransport;

  constructor(private properties: MailSenderProperties) {
    switch (properties.type) {
      case TransportType.SMTP:
        if (properties.smtpConfig === undefined) {
          throw new Error("SMTP transport configuration does not exist");
        }
        this.sender = new SmtpTransport({
          transportConfig: properties.smtpConfig.transportConfig,
          templatesRoot: properties.smtpConfig.templatesRoot,
        });
        break;
      case TransportType.SENDGRID:
        if (properties.sendGridConfig === undefined) {
          throw new Error("SendGrid transport configuration does not exist");
        }
        this.sender = new SendGridTransport({
          authKey: properties.sendGridConfig.authKey,
        });
        break;
      default:
        throw new Error("Incorrect transport type");
    }
  }

  public send(recipients: MailMessage[]): Promise<any[]> {
    return this.sender.send(recipients);
  }
}
