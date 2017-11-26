import * as url from "url"; // needed for the implicit d.ts files generating
import * as fs from "fs";
import * as os from "os";

import {Options} from "./model";
import {nowMs, promisify} from "./private";

const WIN32_PLATFORM = "win32";
const WIN32_LOCKED_RESOURCE_ERR_CODES = new Set(["EPERM"]);

const DEFAULT_OPTIONS: Options = {
    retryIntervalMs: 50,
    retryTimeoutMs: 30 * 1000,
    // TODO consider adding "callsLimit" like option
};

const stubs = {
    copyFile: (src: fs.PathLike, dest: fs.PathLike, flags: number, cb: (err: NodeJS.ErrnoException) => void): void => process.nextTick(cb),
    lchmod: (path: fs.PathLike, mode: string | number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
    lchown: (path: fs.PathLike, uid: number, gid: number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
};

// in order to generate the d.ts files automatically functions mapping listed explicitly
export const originalInstance = Object.freeze({
    // exists: promisify(fs.exists), // deprecated
    access: promisify(fs.access),
    appendFile: promisify(fs.appendFile),
    chmod: promisify(fs.chmod),
    chown: promisify(fs.chown),
    close: promisify(fs.close),
    copyFile: promisify(fs.copyFile || stubs.copyFile),
    fchmod: promisify(fs.fchmod),
    fchown: promisify(fs.fchown),
    fdatasync: promisify(fs.fdatasync),
    fstat: promisify(fs.fstat),
    fsync: promisify(fs.fsync),
    ftruncate: promisify(fs.ftruncate),
    futimes: promisify(fs.futimes),
    lchmod: promisify(fs.lchmod || stubs.lchmod),
    lchown: promisify(fs.lchown || stubs.lchown),
    lstat: promisify(fs.lstat),
    mkdir: promisify(fs.mkdir),
    mkdtemp: promisify(fs.mkdtemp),
    open: promisify(fs.open),
    read: promisify(fs.read),
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir),
    readlink: promisify(fs.readlink),
    realpath: promisify(fs.realpath),
    rename: promisify(fs.rename),
    rmdir: promisify(fs.rmdir),
    stat: promisify(fs.stat),
    symlink: promisify(fs.symlink),
    truncate: promisify(fs.truncate),
    unlink: promisify(fs.unlink),
    utimes: promisify(fs.utimes),
    write: promisify(fs.write),
    writeFile: promisify(fs.writeFile),
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
