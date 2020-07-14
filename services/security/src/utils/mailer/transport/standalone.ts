import { GenericTransport, MailMessage } from "../mailer";
import { compileFile, compileTemplate } from "pug";
import { createTransport, Transporter, TransportOptions } from "nodemailer";
import * as SMTPConnection from "nodemailer/lib/smtp-connection";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { SmtpConfiguration } from "../../../config/config";

export interface NodeMailerTransportConfig extends SMTPConnection.Options, MailOptions, TransportOptions {}

export interface StandaloneTransportProperties {
  smtpConfiguration: SmtpConfiguration;
}

export interface CompiledTemplate {
  subject: compileTemplate;
  content: compileTemplate;
}

export class StandaloneTransport implements GenericTransport {
  private mailTransport: Transporter;

  private compiledTemplates = new Map<string, CompiledTemplate>();

  constructor(private properties: StandaloneTransportProperties) {
    this.mailTransport = createTransport(properties.smtpConfiguration);
  }

  private compileTemplate(templateId: string): CompiledTemplate {
    const compiledTemplateCache: any = this.compiledTemplates.get(templateId);
    if (compiledTemplateCache !== undefined) {
      return {
        subject: compiledTemplateCache.subject,
        content: compiledTemplateCache.content,
      };
    }
    const subject = compileFile(`${templateId}/subject.pug`);
    const content = compileFile(`${templateId}/content.pug`);
    const compiledTemplate = {
      subject,
      content,
    };
    this.compiledTemplates.set(templateId, compiledTemplate);
    return compiledTemplate;
  }

  public async send(message: MailMessage): Promise<any> {
    const compiledTemplate = this.compileTemplate(message.template.id);
    const subject = compiledTemplate.subject(message.template.parameters);
    const html = compiledTemplate.content(message.template.parameters);

    return this.mailTransport.sendMail({
      from: `"${message.sender.name}" <${message.sender.email}>`,
      to: message.recipient.to.join(", "),
      subject,
      html,
    });
  }
}
