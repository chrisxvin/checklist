import { log } from "../utils/logger";

(global) && ((global as any).log = log);

export * from "./db";
