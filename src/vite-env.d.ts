/// <reference types="vite/client" />

declare type LogFunction = (...data: any[]) => void;

declare interface ILogger {
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
}

declare const log: LogFunction & ILogger;

export { };
