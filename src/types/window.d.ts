declare global {
    interface Window {
        GMapsReady?: Function;
        isMobile: boolean;
    }

    var isMobile: boolean;
}

declare var window: Window & typeof globalThis;

export { };
