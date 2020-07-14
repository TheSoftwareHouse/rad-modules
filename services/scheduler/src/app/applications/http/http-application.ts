import { Application } from "../../application.types";
import { Server } from "http";
import { Logger } from "winston";

export interface HttpApplicationProps {
  server: Server;
  port: number;
  logger: Logger;
}

export class HttpApplication implements Application {
  constructor(private dependencies: HttpApplicationProps) {}

  public async start(): Promise<void> {
    const { server, port, logger } = this.dependencies;
    server.listen(port);
    logger.info(`App running on port ${port}`);
  }
}
