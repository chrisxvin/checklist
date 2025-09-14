declare global {
    var TRACE: boolean;
    var DEBUG: boolean;
    var RELEASE: boolean;
    var log: LogFunction & ILogger;
    var isMobile: boolean;
}

declare var globalThis: Global & typeof globalThis;
declare const log: LogFunction & ILogger;

export { };
