import * as os from "os";
import {test} from "ava";

import {instance, WIN32_PLATFORM} from "dist/index"; // importing the built/final code
import {file, fileData, nowMs, waitPromise} from "./util";

test(`rename locked file "${file}"`, async (t) => {
    const testStartTime = nowMs();
    const fs = instance();

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

    if (os.platform() === WIN32_PLATFORM) {
        const minValue = 1500;
        t.true(renameWaitTime >= minValue, `"renameWaitTime" (${renameWaitTime}) should be >= ${minValue} on win32 platform`);
    } else {
        const maxValue = 300;
        t.true(renameWaitTime < maxValue, `renameWaitTime is expected to be < ${maxValue} on the non win32 platform (there is no locking)`);
    }
});
