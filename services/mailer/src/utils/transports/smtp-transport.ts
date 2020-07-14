import { GenericTransport, MailMessage } from "../mail-sender";
import { compileFile, compileTemplate } from "pug";
import * as fs from "fs";
import { createTransport, Transporter, TransportOptions } from "nodemailer";
import * as SMTPConnection from "nodemailer/lib/smtp-connection";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { AppError } from "../../errors/app.error";

export interface NodeMailerTransportConfig extends SMTPConnection.Options, MailOptions, TransportOptions {}

export interface SmtpTransportConfig {
  transportConfig: NodeMailerTransportConfig;
  templatesRoot: string;
}

export interface CompiledTemplate {
  subject: compileTemplate;
  content: compileTemplate;
}

export class SmtpTransport implements GenericTransport {
  private mailTransport: Transporter;

  private compiledTemplates = new Map<string, CompiledTemplate>();

  constructor(private properties: SmtpTransportConfig) {
    this.mailTransport = createTransport(properties.transportConfig);
  }

  private templateFileExists(path: string): Promise<boolean> {
    return fs.promises
      .access(path)
      .then(() => true)
      .catch(() => false);
  }

  private async compileTemplate(templateId: string): Promise<CompiledTemplate> {
    const compiledTemplateCache: any = this.compiledTemplates.get(templateId);
    if (compiledTemplateCache !== undefined) {
      return {
        subject: compiledTemplateCache.subject,
        content: compiledTemplateCache.content,
      };
    }
    const subjectPath = `${this.properties.templatesRoot}/${templateId}/subject.pug`;
    const contentPath = `${this.properties.templatesRoot}/${templateId}/content.pug`;

    if (!(await this.templateFileExists(subjectPath)) || !(await this.templateFileExists(contentPath))) {
      throw new AppError(`Template ${templateId} is missing subject or content template.`);
    }

    const subject = compileFile(subjectPath);
    const content = compileFile(contentPath);
    const compiledTemplate = {
      subject,
      content,
    };
    this.compiledTemplates.set(templateId, compiledTemplate);
    return compiledTemplate;
  }

  public send(mailMessages: MailMessage[]): Promise<any[]> {
    const mailsToSend = mailMessages.map(async (message) => {
      const compiledTemplate = await this.compileTemplate(message.template.id);
      const subject = compiledTemplate.subject(message.template.parameters);
      const html = compiledTemplate.content(message.template.parameters);
      const attachments: any = [];
      if (message.attachments) {
        message.attachments.forEach((attachment) => {
          attachments.push({
            filename: attachment.fileName,
            content: attachment.content,
            encoding: "base64",
          });
        });
      }
      return this.mailTransport.sendMail({
        from: `"${message.sender.name}" <${message.sender.email}>`,
        to: message.recipient.to.join(", "),
        cc: message.recipient.cc === undefined ? "" : message.recipient.cc.join(", "),
        bcc: message.recipient.bcc === undefined ? "" : message.recipient.bcc.join(", "),
        subject,
        html,
        attachments,
      });
    });
    return Promise.all(mailsToSend);
  }
}
