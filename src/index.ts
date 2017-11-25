import * as url from "url"; // needed for the implicit d.ts files generating
import * as fs from "fs";
import * as os from "os";

import {Options, UtilPromisify} from "./model";

// tslint:disable:no-var-requires
const promisify = require("util.promisify") as UtilPromisify;
// tslint:enable:no-var-requires

export const WIN32_PLATFORM = "win32";
const WIN32_LOCKED_RESOURCE_ERR_CODES = new Set(["EPERM"]);

const DEFAULT_OPTIONS: Options = {
    retryTimeoutMs: 30 * 1000,
    retryIntervalMs: 50,
    // TODO consider adding "callsLimit" like option
};

const stubs = {
    lchown: (path: fs.PathLike, uid: number, gid: number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
    lchmod: (path: fs.PathLike, mode: string | number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
    copyFile: (src: fs.PathLike, dest: fs.PathLike, flags: number, cb: (err: NodeJS.ErrnoException) => void): void => process.nextTick(cb),
};

// in order to generate the d.ts files automatically functions mapping listed explicitly
export const originalInstance = Object.freeze({
    rename: promisify(fs.rename),
    truncate: promisify(fs.truncate),
    ftruncate: promisify(fs.ftruncate),
    chown: promisify(fs.chown),
    fchown: promisify(fs.fchown),
    lchown: promisify(fs.lchown || stubs.lchown),
    chmod: promisify(fs.chmod),
    fchmod: promisify(fs.fchmod),
    lchmod: promisify(fs.lchmod || stubs.lchmod),
    stat: promisify(fs.stat),
    fstat: promisify(fs.fstat),
    lstat: promisify(fs.lstat),
    symlink: promisify(fs.symlink),
    readlink: promisify(fs.readlink),
    realpath: promisify(fs.realpath),
    unlink: promisify(fs.unlink),
    rmdir: promisify(fs.rmdir),
    mkdir: promisify(fs.mkdir),
    mkdtemp: promisify(fs.mkdtemp),
    readdir: promisify(fs.readdir),
    close: promisify(fs.close),
    open: promisify(fs.open),
    utimes: promisify(fs.utimes),
    futimes: promisify(fs.futimes),
    fsync: promisify(fs.fsync),
    write: promisify(fs.write),
    read: promisify(fs.read),
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
    appendFile: promisify(fs.appendFile),
    // exists: promisify(fs.exists), // deprecated
    access: promisify(fs.access),
    fdatasync: promisify(fs.fdatasync),
    copyFile: promisify(fs.copyFile || stubs.copyFile),
});

export function instantiate(options?: Partial<Options>): typeof originalInstance {
    const fullOptions: Options = {...DEFAULT_OPTIONS, ...options};

    return Object.keys(originalInstance)
        .reduce((map, functionName) => {
            const fn = (originalInstance as any)[functionName] as any;
            map[functionName] = (...args: any[]) => retryOnLockedResourceError(() => fn(...args), fullOptions);
            return map;
        }, {} as any);
}

const nowMs = () => Number(new Date());

async function retryOnLockedResourceError<T>(action: (...args: any[]) => Promise<T>, options: Options): Promise<T> {
    if (os.platform() !== WIN32_PLATFORM) {
        return await action();
    }

    const startTime = nowMs();
    const actionExecutionAttempt: () => Promise<T> = async () => {
        try {
            return await action();
        } catch (error) {
            const timeDiffMs = nowMs() - startTime;

            if (WIN32_LOCKED_RESOURCE_ERR_CODES.has(error.code) && timeDiffMs < options.retryTimeoutMs) {
                await new Promise((resolve) => setTimeout(resolve, options.retryIntervalMs));
                return await actionExecutionAttempt();
            }

            throw error;
        }
    };

    return await actionExecutionAttempt();
}
