# fs-no-eperm-anymore

is a Node.js module that reduces EPERM errors on win32 platform using retry approach.

## Notes

- Original "fs" methods are wrapped into the ES2015 Promises.
- Module exposes only the `async` functions. Retry approach is used and so it won't make much sense to `sleep` the main process just to support `sync` methods set.
- Default options values:

```typescript
    const options = {
        retryTimeoutMs: 30 * 1000,
        retryIntervalMs: 50,
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
