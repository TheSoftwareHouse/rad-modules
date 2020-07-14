import { appConfig } from "../../../config/config";
import { swaggerFactory } from "./swagger-factory";

export default swaggerFactory(appConfig.apiKeyHeaderName);
