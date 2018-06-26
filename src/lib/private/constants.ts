// TODO TS4023: get rid of the not actually used "url" import
// related issue https://github.com/Microsoft/TypeScript/issues/9944
import fs from "fs";
import url from "url";

import {promisify} from "./promisify";
import {Options} from "./model";

// tslint:disable:object-literal-sort-keys
export const DEFAULT_OPTIONS: Options = Object.freeze({
    items: [
        {
            platforms: ["win32"],
            errorCodes: ["EPERM"], // https://nodejs.org/api/errors.html#errors_common_system_errors
            options: {
                retryIntervalMs: 100,
                retryTimeoutMs: 10 * 1000,
            },
        },
    ],
});
// tslint:enable:object-literal-sort-keys

const STUBS = Object.freeze({
    copyFile: (src: fs.PathLike, dest: fs.PathLike, flags: number, cb: (err: NodeJS.ErrnoException) => void): void => process.nextTick(cb),
    lchmod: (path: fs.PathLike, mode: string | number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
    lchown: (path: fs.PathLike, uid: number, gid: number, cb: (err: NodeJS.ErrnoException) => void) => process.nextTick(cb),
});

// in order to generate the d.ts files automatically functions mapping listed explicitly
export const FUNCTIONS = Object.freeze({
    access: promisify(fs.access),
    appendFile: promisify(fs.appendFile),
    chmod: promisify(fs.chmod),
    chown: promisify(fs.chown),
    close: promisify(fs.close),
    copyFile: promisify(fs.copyFile || STUBS.copyFile),
    // exists: promisify(fs.exists), // deprecated
    fchmod: promisify(fs.fchmod),
    fchown: promisify(fs.fchown),
    fdatasync: promisify(fs.fdatasync),
    fstat: promisify(fs.fstat),
    fsync: promisify(fs.fsync),
    ftruncate: promisify(fs.ftruncate),
    futimes: promisify(fs.futimes),
    lchmod: promisify(fs.lchmod || STUBS.lchmod),
    lchown: promisify(fs.lchown || STUBS.lchown),
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
