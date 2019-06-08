// tslint:disable:object-literal-sort-keys

import os from "os";
import path from "path";
import randomstring from "randomstring";
import nodePlatforms from "node-platforms";
import test from "ava";

import {instantiate, resolveAttemptOptions, Model} from "lib";
import {nowMs, outputDir} from "./util";

const CURRENT_PLATFORM = os.platform();

test(`${instantiate.name}: mounting functions to the instance`, async (t) => {
    const instance = instantiate();

    const instanceFnNames = Object.keys(instance);
    const expectedFnNames = [
        "access",
        "appendFile",
        "chmod",
        "chown",
        "close",
        "copyFile",
        // exists: promisify(fs.exists), // deprecated
        "fchmod",
        "fchown",
        "fdatasync",
        "fstat",
        "fsync",
        "ftruncate",
        "futimes",
        "lchmod",
        "lchown",
        "lstat",
        "mkdir",
        "mkdtemp",
        "open",
        "read",
        "readFile",
        "readdir",
        "readlink",
        "realpath",
        "rename",
        "rmdir",
        "stat",
        "symlink",
        "truncate",
        "unlink",
        "utimes",
        "write",
        "writeFile",
    ];

    instanceFnNames.sort();
    expectedFnNames.sort();

    t.deepEqual(instanceFnNames, expectedFnNames, "all instance properties should be mounted");

    for (const fnName in instance) {
        if (instance.hasOwnProperty(fnName)) {
            t.is(typeof (instance as any)[fnName], "function", `instance["${fnName}"] property should be a function`);
        }
    }
});

test(`${resolveAttemptOptions.name}: platform filter`, (t) => {
    let retryMsCounter = 0;

    const items: Model.OptionsItem[] = [];

    nodePlatforms().forEach((platform: string) => items.push({
        platforms: [platform],
        errorCodes: [randomstring.generate()],
        functions: [randomstring.generate()],
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    }));

    const options: Model.Options = {items};
    const expectedItem: any = options.items.find((item: any) => item.platforms.indexOf(CURRENT_PLATFORM) !== -1);
    const resolvedAttemptOptions = resolveAttemptOptions(expectedItem.functions[0], expectedItem.errorCodes[0], options);

    t.deepEqual(resolvedAttemptOptions, expectedItem.options);
});

test(`${resolveAttemptOptions.name}: weight factor`, (t) => {
    const errorCode = "EPERM";
    const fnName = "rename";
    let retryMsCounter = 0;

    const itemW80: Model.OptionsItem = {
        platforms: [CURRENT_PLATFORM, randomstring.generate()],
        errorCodes: [errorCode, randomstring.generate()],
        functions: [fnName, randomstring.generate()],
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    };
    const itemW80Dup: Model.OptionsItem = {
        ...itemW80,
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    };
    const itemW30: Model.OptionsItem = {
        platforms: [CURRENT_PLATFORM, randomstring.generate()],
        errorCodes: [errorCode, randomstring.generate()],
        // functions: [fnName, randomstring.generate()],
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    };
    const itemW20: Model.OptionsItem = {
        // platforms: [CURRENT_PLATFORM, randomstring.generate()],
        errorCodes: [errorCode, randomstring.generate()],
        // functions: [fnName, randomstring.generate()],
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    };
    const itemW10: Model.OptionsItem = {
        platforms: [CURRENT_PLATFORM, randomstring.generate()],
        // errorCodes: [errorCode, randomstring.generate()],
        // functions: [fnName, randomstring.generate()],
        options: {retryIntervalMs: ++retryMsCounter, retryTimeoutMs: retryMsCounter},
    };

    t.deepEqual(
        // first item starting from the array top should be returned in case of more than 1 items with the same weight found
        // so adding duplicated 16 weight item into the items array middle
        resolveAttemptOptions(fnName, errorCode, {items: [itemW30, itemW80, itemW20, itemW80Dup, itemW10]}),
        itemW80.options,
        `matching "itemW80"`,
    );
    t.deepEqual(
        resolveAttemptOptions(fnName, errorCode, {items: [itemW30, /*itemW16,*/ itemW20, /*itemW16Dup,*/ itemW10]}),
        itemW30.options,
        `matching "itemW30"`,
    );
    t.deepEqual(
        resolveAttemptOptions(fnName, errorCode, {items: [/*itemW6, itemW16,*/ itemW20, /*itemW16Dup,*/ itemW10]}),
        itemW20.options,
        `matching "itemW20"`,
    );
    t.deepEqual(
        resolveAttemptOptions(fnName, errorCode, {items: [/*itemW6, itemW16, itemW5, itemW16Dup,*/ itemW10]}),
        itemW10.options,
        `matching "itemW10"`,
    );
});

test(`${resolveAttemptOptions.name}: empty filters`, (t) => {
    const item: Model.OptionsItem = {
        options: {retryIntervalMs: 1, retryTimeoutMs: 2},
    };

    t.deepEqual(
        resolveAttemptOptions(randomstring.generate() as any, randomstring.generate(), {items: [item]}),
        item.options,
    );
});

test(`custom error code delay`, async (t) => {
    const retryTimeoutMs = 2 * 1000;
    const instance = instantiate({
        // verbose: true,
        items: [
            {
                errorCodes: ["ENOENT"], // weight: 20
                options: {
                    retryIntervalMs: 100,
                    retryTimeoutMs: retryTimeoutMs * 2,
                },
            },
            {
                // errorCodes: ["ENOENT"],
                functions: ["stat"], // weight: 50
                options: {
                    retryIntervalMs: 100,
                    retryTimeoutMs,
                },
            },
        ],
    });
    const file = path.join(outputDir, randomstring.generate());
    const startTime = nowMs();
    await t.throwsAsync(instance.stat(file));
    const timeDiffMs = nowMs() - startTime;
    t.true(timeDiffMs >= retryTimeoutMs, `timeDiffMs (${timeDiffMs}) >= retryTimeoutMs ${retryTimeoutMs}`);
});
