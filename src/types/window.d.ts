declare global {
    interface Window {
        TRACE: boolean;
        DEBUG: boolean;
        RELEASE: boolean;

        GMapsReady?: Function;
        isMobile: boolean;
    }

}

declare var window: Window & typeof globalThis;

export { };
