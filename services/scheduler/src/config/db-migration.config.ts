const dbConfig = {
  type: "postgres",
  url: process.env.CONNECTION_STRING || "postgres://postgres:password@postgres:5432/scheduler",
  synchronize: false,
  logging: (process.env.DB_LOGGING || "true") === "true",
  entities: ["src/**/*.model.*"],
  migrations: ["src/migrations/*"],
  cli: {
    migrationsDir: "../../../services/scheduler/src/migrations",
  },
};

export = dbConfig;
