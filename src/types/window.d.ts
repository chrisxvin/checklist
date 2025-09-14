declare global {
    declare type LogFunction = (...data: any[]) => void;

    declare interface ILogger {
        error: LogFunction;
        warn: LogFunction;
        info: LogFunction;
        debug: LogFunction;
        trace: LogFunction;
    }

    interface Window {
        TRACE: boolean;
        DEBUG: boolean;
        RELEASE: boolean;

        GMapsReady?: Function;
        log: LogFunction & ILogger;
        isMobile: boolean;
    }

    declare const log: LogFunction & ILogger;
}

declare var window: Window & typeof globalThis;
declare const log: LogFunction & ILogger;

export { };
