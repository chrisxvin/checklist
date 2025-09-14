declare global {
    export type Action = () => void;
    export type Action1<T> = (arg: T) => void;
    export type Action2<T1, T2> = (arg1: T1, arg2: T2) => void;
    export type Action3<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;

    export type Func<R> = () => R;
    export type Func1<T, R> = (arg: T) => R;
    export type Func2<T1, T2, R> = (arg1: T1, arg2: T2) => R;
    export type Func3<T1, T2, T3, R> = (arg1: T1, arg2: T2, arg3: T3) => R;

    export type Nullable<T> = T | null | undefined;
}

export { };
