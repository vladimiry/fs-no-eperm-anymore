# fs-no-eperm-anymore

is a Node.js module that reduces EPERM or other errors on win32 or other platforms using retry loop approach.

[![Build Status: Linux / MacOS](https://travis-ci.org/vladimiry/fs-no-eperm-anymore.svg?branch=master)](https://travis-ci.org/vladimiry/fs-no-eperm-anymore) [![Build status: Windows](https://ci.appveyor.com/api/projects/status/20fesahtjfikfo9x?svg=true)](https://ci.appveyor.com/project/vladimiry/fs-no-eperm-anymore)

## Notes

- Original "fs" methods are wrapped into the ES2015 Promises.
- Module exposes only the `async` functions. Retry approach is used and so it won't make much sense to `sleep` the main process just to support `sync` methods set.
- You can see some details about the `options` parameter in the [Making options more flexible](https://github.com/vladimiry/fs-no-eperm-anymore/issues/1) issue. Default `options` value:

```typescript
    const options = {
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
    };
```

## Code Example

```typescript
    import {instantiate} from "fs-no-eperm-anymore";
    // const fs = require("fs-no-eperm-anymore").instantiate();
     
    // options parameter is optional
    const fs = instantiate(/*options*/);
    
    fs.rename("from.txt", "to.txt")
        .then(() => console.log("Successful renaming"))
        .catch((error) => console.log("Renaming failed with the error", error));    
```

## Links
 * https://github.com/isaacs/node-graceful-fs/pull/119 - more details about the EPERM errors.
 * https://nodejs.org/api/errors.html#errors_common_system_errors - Common System Errors
