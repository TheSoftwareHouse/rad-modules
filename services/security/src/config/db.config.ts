import { Joi } from "celebrate";

export type DbConfig = {
  type: "postgres"; // extend as necessary
  url: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  cli: { migrationsDir: string };
  name?: string;
};

export const DbConfigSchema = Joi.object({
  type: Joi.string().valid("postgres").required(),
  url: Joi.string().uri().required(),
  synchronize: Joi.boolean().required(),
  logging: Joi.boolean().required(),
  entities: Joi.array().items(Joi.string()).required(),
  migrations: Joi.array().items(Joi.string()).required(),
  cli: Joi.object({
    migrationsDir: Joi.string().required(),
  }).required(),
  name: Joi.string(),
});

export const getDbConfig = (): DbConfig => ({
  type: "postgres",
  url: process.env.CONNECTION_STRING || "postgres://postgres:password@postgres:5432/users",
  synchronize: false,
  logging: (process.env.DB_LOGGING || "true") === "true",
  entities: ["/app/build/services/security/src/**/*.model.*"],
  migrations: ["/app/build/services/security/src/migrations/*"],
  cli: {
    migrationsDir: "src/migrations",
  },
});
