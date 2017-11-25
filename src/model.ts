export interface Options {
    retryTimeoutMs: number;
    retryIntervalMs: number;
}

// tslint:disable:max-line-length
// tslint:disable:ban-types

// following code taken from there https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/index.d.ts
/**
 * @deprecated TODO get rid of the "CustomPromisify" as soon as "util.promisify" provides the @types/d.ts
 */
export interface CustomPromisify<TCustom extends Function> extends Function {
    __promisify__: TCustom;
}

// following code taken from there https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/index.d.ts
/**
 * @deprecated TODO get rid of the "UtilPromisify" as soon as "util.promisify" provides the @types/d.ts
 */
export interface UtilPromisify {
    <TCustom extends Function>(fn: CustomPromisify<TCustom>): TCustom;
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
    (fn: Function): Function;
}

// tslint:enable:max-line-length
// tslint:enable:ban-types
