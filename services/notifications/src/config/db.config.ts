import { Joi } from "celebrate";
import * as dbConfig from "./db-migration.config";

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

export const getDbConfig = (): DbConfig => dbConfig as DbConfig;
