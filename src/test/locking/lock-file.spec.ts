import * as mkdirp from "mkdirp";
import {test} from "ava";

import {instantiate} from "dist"; // import the built/final code
import {file, fileData, lockTime, nowMs, outputDir, waitPromise} from "../util";

test(`lock file : "${file}"`, async (t) => {
    mkdirp.sync(outputDir);

    const fs = instantiate();

    await fs.writeFile(file, fileData);

    // start locking
    const lockingStartTime = nowMs();
    const fd = await fs.open(file, "r+");
    await waitPromise(lockTime);

    // end locking
    await fs.close(fd);

    // test that waiting has actually happened
    const lockedTime = nowMs() - lockingStartTime;
    t.true(lockedTime >= lockTime, `lockedTime (${lockedTime}) >= lockTime (${lockTime})`);
});
