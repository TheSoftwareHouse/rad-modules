import { StandaloneTransport } from "./transport/standalone";
import { ExternalTransport } from "./transport/external";
import { NoneTransport } from "./transport/none";
import { MailerConfig, MailerType } from "../../config/config";
import { Logger } from "@tshio/logger";

export type Template = {
  id: string;
  parameters: {
    [key: string]: any;
  };
};

export type Sender = {
  name: string;
  email: string;
};

export type Recipient = {
  to: string[];
  cc?: string[];
  bcc?: string[];
};

export interface MailMessage {
  sender: Sender;
  recipient: Recipient;
  template: Template;
}

export interface GenericTransport {
  send(message: MailMessage): Promise<any>;
}

export interface MailerProperties {
  mailerConfig: MailerConfig;
  logger: Logger;
}

interface TemplateParameters {
  [key: string]: any;
}

export class Mailer {
  private sender: GenericTransport;

  constructor(private dependencies: MailerProperties) {
    const { type, standalone, mailerUrl } = dependencies.mailerConfig;

    switch (type) {
      case MailerType.Standalone:
        this.sender = new StandaloneTransport({ smtpConfiguration: standalone });
        break;
      case MailerType.External:
        this.sender = new ExternalTransport({ mailerUrl });
        break;
      case MailerType.Disabled:
        this.sender = new NoneTransport();
        break;
      default:
        throw new Error("Unknown transport type");
    }
  }

  public sendCreateUser(email: string, name: string, user: string): Promise<void> {
    const { logger } = this.dependencies;
    const { sender, template } = this.dependencies.mailerConfig;

    logger.info(`New user '${user}', send info to '${name} <${email}>'`);

    const mailMessage = this.prepareMessage(sender.email, sender.name, email, template.createUser, { user, name });

    return this.sender.send(mailMessage);
  }

  public sendResetPassword(email: string, name: string, password: string): Promise<void> {
    const { logger } = this.dependencies;
    const { sender, template } = this.dependencies.mailerConfig;

    logger.info(`Reset password, send info to '${name} <${email}>'`);

    const mailMessage = this.prepareMessage(sender.email, sender.name, email, template.resetPassword, {
      password,
      name,
    });

    return this.sender.send(mailMessage);
  }

  public sendResetPasswordToken(email: string, token: string): Promise<void> {
    const { logger } = this.dependencies;
    const { sender, template, newPasswordSpaUrl } = this.dependencies.mailerConfig;

    logger.info(`Reset password token, send info to '$<${email}>'`);

    const mailMessage = this.prepareMessage(sender.email, sender.name, email, template.resetPasswordToken, {
      token,
      name: email,
      spaUrl: newPasswordSpaUrl,
    });

    return this.sender.send(mailMessage);
  }

  private prepareMessage(
    senderEmail: string = "",
    senderName: string = "",
    recipientEmail: string,
    template: string = "",
    parameters: TemplateParameters,
  ): MailMessage {
    return {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      recipient: {
        to: [recipientEmail],
      },
      template: {
        id: template,
        parameters,
      },
    };
  }
}
