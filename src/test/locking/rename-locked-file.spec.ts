import * as os from "os";
import {test} from "ava";

import {instantiate} from "dist";
import {file, fileData, nowMs, waitPromise} from "../util";

test(`rename locked file "${file}"`, async (t) => {
    const testStartTime = nowMs();
    const fs = instantiate();

    // give 1000 to another process for file creating
    await waitPromise(1000);

    // read existing file
    t.is((await fs.readFile(file)).toString(), fileData, "should be able to read the locked file");

    // build new file
    const newFileData = `${fileData}+${fileData}`;
    const newFileName = `${file}.${nowMs()}`;
    await fs.writeFile(newFileName, newFileData);

    // replace existing file by the new file (existing file is locked by another process for "lockTime"ms)
    const renameStartTime = nowMs();
    await fs.rename(newFileName, file);
    const renameWaitTime = nowMs() - renameStartTime;

    // read file with new data
    t.is((await fs.readFile(file)).toString(), newFileData, "should be able to read the same file but with new data");

    // clear resources
    await fs.unlink(file);

    // tslint:disable:no-console
    if (os.platform() === "win32") {
        const minValue = 2000;
        const msg = `"renameWaitTime" (${renameWaitTime}) should be >= ${minValue} on win32 platform`;
        t.true(renameWaitTime >= minValue, msg);
        console.log(msg);
    } else {
        const maxValue = 300;
        const msg = `renameWaitTime (${renameWaitTime}) is expected to be < ${maxValue} on the non win32 platform`;
        t.true(renameWaitTime < maxValue, msg);
        console.log(msg);
    }
    // tslint:enable:no-console
});
