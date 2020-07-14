import { Joi } from "celebrate";

export enum MailerType {
  Disabled = "disabled",
  Standalone = "standalone",
  External = "external",
}

export type SmtpConfiguration = {
  pool: boolean;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type MailerConfig = {
  type: MailerType;
  mailerUrl: string;
  standalone: SmtpConfiguration;
  newPasswordSpaUrl: string;
  template: {
    createUser: string;
    resetPassword: string;
    resetPasswordToken: string;
  };
  sender: {
    name: string;
    email: string;
  };
};

export const MailerSchema = Joi.object({
  type: Joi.string().valid("disabled", "standalone", "external").required(),
  mailerUrl: Joi.string().required(),
  newPasswordSpaUrl: Joi.string().required(),
  standalone: Joi.object({
    pool: Joi.boolean().required(),
    host: Joi.string().required(),
    port: Joi.number().port().required(),
    secure: Joi.boolean().required(),
    auth: Joi.object({
      user: Joi.string().allow("").required(),
      pass: Joi.string().allow("").required(),
    }).required(),
  }).required(),
  template: Joi.object({
    createUser: Joi.string().required(),
    resetPassword: Joi.string().required(),
    resetPasswordToken: Joi.string().required(),
  }),
  sender: Joi.object({
    name: Joi.string().allow("").required(),
    email: Joi.string().email().required(),
  }),
});

export const getMailerConfig = (): MailerConfig => ({
  type: process.env.MAILER_TYPE ? (process.env.MAILER_TYPE as MailerType) : MailerType.Disabled,
  mailerUrl: process.env.MAILER_URL || "http://localhost/",
  newPasswordSpaUrl: process.env.MAILER_NEW_PASSWORD_SPA_URL || "http://localhost:3000/new-password",
  standalone: {
    pool: (process.env.MAILER_SMTP_POOL || "true") === "true",
    host: process.env.MAILER_SMTP_HOST || "localhost",
    port: +(process.env.MAILER_SMTP_PORT || 465),
    secure: process.env.MAILER_SMTP_SECURE ? process.env.MAILER_SMTP_SECURE.toLowerCase() === "true" : true,
    auth: {
      user: process.env.MAILER_SMTP_USER || "",
      pass: process.env.MAILER_SMTP_PASS || "",
    },
  },
  template: {
    createUser:
      process.env.MAILER_TEMPLATE_CREATE_USER ||
      "/app/services/security/src/utils/mailer/templates/create-user/default/",
    resetPassword:
      process.env.MAILER_TEMPLATE_RESET_PASSWORD ||
      "/app/services/security/src/utils/mailer/templates/reset-password/default/",
    resetPasswordToken:
      process.env.MAILER_TEMPLATE_RESET_PASSWORD_TOKEN ||
      "/app/services/security/src/utils/mailer/templates/reset-password-token/default/",
  },
  sender: {
    name: process.env.MAILER_SENDER_NAME || "Joe Doe",
    email: process.env.MAILER_SENDER_EMAIL || "joe.doe@example.com",
  },
});
