/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

const error = console.error.bind(console);
const warn = console.warn.bind(console);
const info = console.info.bind(console);
const debug = globalThis.DEBUG ? console.log.bind(console) : () => { };
const trace = globalThis.TRACE ? console.debug.bind(console) : () => { };

const _log = console.log.bind(console) as any;
_log.error = error;
_log.warn = warn;
_log.info = info;
_log.debug = debug;
_log.trace = trace;

export const log: LogFunction & ILogger = _log;
