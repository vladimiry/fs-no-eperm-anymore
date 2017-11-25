export interface Options {
    retryTimeoutMs: number;
    retryIntervalMs: number;
}

/**
 * @deprecated TODO get rid of the "UtilPromisify" as soon as "util.promisify" provides the @types/d.ts
 */
export interface UtilPromisify {
    // tslint:disable:max-line-length

    <TResult>(fn: (callback: (err: Error, result: TResult) => void) => void): () => Promise<TResult>;

    (fn: (callback: (err: Error) => void) => void): () => Promise<void>;

    <T1, TResult>(fn: (arg1: T1, callback: (err: Error, result: TResult) => void) => void): (arg1: T1) => Promise<TResult>;

    <T1>(fn: (arg1: T1, callback: (err: Error) => void) => void): (arg1: T1) => Promise<void>;

    <T1, T2, TResult>(fn: (arg1: T1, arg2: T2, callback: (err: Error, result: TResult) => void) => void): (arg1: T1, arg2: T2) => Promise<TResult>;

    <T1, T2>(fn: (arg1: T1, arg2: T2, callback: (err: Error) => void) => void): (arg1: T1, arg2: T2) => Promise<void>;

    <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: (err: Error, result: TResult) => void) => void): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;

    <T1, T2, T3>(fn: (arg1: T1, arg2: T2, arg3: T3, callback: (err: Error) => void) => void): (arg1: T1, arg2: T2, arg3: T3) => Promise<void>;

    <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (err: Error, result: TResult) => void) => void): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;

    <T1, T2, T3, T4>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback: (err: Error) => void) => void): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<void>;

    <T1, T2, T3, T4, T5, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err: Error, result: TResult) => void) => void): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TResult>;

    <T1, T2, T3, T4, T5>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err: Error) => void) => void): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<void>;

    // tslint:disable:max-line-length
}
