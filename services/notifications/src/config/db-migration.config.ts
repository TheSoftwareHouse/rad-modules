const dbConfig = {
  type: "postgres",
  url: process.env.CONNECTION_STRING || "postgres://postgres:password@postgres:5432/notifications",
  synchronize: false,
  logging: (process.env.DB_LOGGING || "true") === "true",
  entities: ["src/**/*.model.*"],
  migrations: ["src/migrations/*"],
  cli: {
    migrationsDir: "../../../services/notifications/src/migrations",
  },
};

export = dbConfig;
