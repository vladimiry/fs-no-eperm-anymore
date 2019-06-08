import test from "ava";

import {instantiate} from "lib"; // import the built/final code
import {file, fileData, lockTime, nowMs, waitPromise} from "../util";

test(`lock file : "${file}"`, async (t) => {
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
