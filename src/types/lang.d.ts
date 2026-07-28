declare global {
    export interface Ref<T = any, S = T> {
        get value(): T;
        set value(_: S);
    }
}

export { };
