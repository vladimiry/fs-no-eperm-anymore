import {platform} from "os";

import {nowMs} from "./index";
import {DEFAULT_OPTIONS, FUNCTIONS} from "./constants";
import {AttemptOptions, Options} from "./model";

const CURRENT_PLATFORM = platform();

export function instantiate(options?: Options): typeof FUNCTIONS {
    return Object.keys(FUNCTIONS)
        .reduce((map, fnName) => {
            const fn = (FUNCTIONS as any)[fnName] as any;
            map[fnName] = (...args: any[]) => retryLoop(fnName as any, () => fn(...args), options || DEFAULT_OPTIONS);
            return map;
        }, {} as any);
}

async function retryLoop<T>(fnName: keyof typeof FUNCTIONS, action: (...args: any[]) => Promise<T>, options: Options): Promise<T> {
    const actionExecutionAttempt: () => Promise<T> = async () => {
        try {
            iteration++;

            if (options.verbose) {
                // tslint:disable:no-console
                console.log("iteration:", JSON.stringify({pid: process.pid, function: fnName, iteration}));
                // tslint:enable:no-console
            }

            return await action();
        } catch (error) {
            if (!error.code) {
                throw error;
            }

            const attemptOptions = resolveAttemptOptions(fnName, error.code, options);

            if (!attemptOptions
                || typeof attemptOptions.retryIntervalMs !== "number"
                || typeof attemptOptions.retryTimeoutMs !== "number") {
                throw error;
            }

            const timeDiffMs = nowMs() - startTime;

            if (timeDiffMs < attemptOptions.retryTimeoutMs) {
                await new Promise((resolve) => setTimeout(resolve, attemptOptions.retryIntervalMs));
                return await actionExecutionAttempt();
            }

            if (options.verbose) {
                // tslint:disable:no-console
                console.log("timeout:", JSON.stringify({pid: process.pid, function: fnName, iteration, timeDiffMs, attemptOptions}));
                // tslint:enable:no-console
            }

            throw error;
        }
    };
    const startTime = nowMs();
    let iteration = 0;

    return await actionExecutionAttempt();
}

export function resolveAttemptOptions(fnName: keyof typeof FUNCTIONS, errorCode: string, {items}: Options): AttemptOptions | undefined {
    const resolvedItems = items.reduce((result, {platforms, errorCodes, functions, options}) => {
        let weight = 0;

        if (!platforms || !platforms.length) {
            weight += 1;
        } else if (platforms.indexOf(CURRENT_PLATFORM) !== -1) {
            weight += 10;
        } else {
            return result;
        }

        if (!errorCodes || !errorCodes.length) {
            weight += 1;
        } else if (errorCodes.indexOf(errorCode) !== -1) {
            weight += 20;
        } else {
            return result;
        }

        if (!functions || !functions.length) {
            weight += 1;
        } else if (functions.indexOf(fnName) !== -1) {
            weight += 50;
        } else {
            return result;
        }

        if (weight) {
            result.push({weight, options});
        }

        return result;
    }, [] as Array<{ options: AttemptOptions; weight: number; }>);

    // order by "weight" desc
    resolvedItems.sort((a, b) => b.weight - a.weight);

    const resolveItem = resolvedItems.shift();

    if (resolveItem) {
        return resolveItem.options;
    }

    return;
}
