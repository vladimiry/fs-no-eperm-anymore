import {test} from "ava";

import {instantiate, originalInstance} from "dist"; // import the built/final code

test("types of the exported items", async (t) => {
    const customInstance = instantiate();

    t.is(typeof instantiate, "function", "\"instantiate\" is a function");
    t.is(typeof customInstance, "object", "instantiated thing is an object");
    t.is(typeof originalInstance, "object", "\"originalInstance\" is an object");
});

test("mounting function to the instance", async (t) => {
    const customInstance = instantiate();

    const originalInstanceNames = Object.keys(originalInstance);
    const customInstanceNames = Object.keys(customInstance);

    originalInstanceNames.sort();
    customInstanceNames.sort();

    t.deepEqual(customInstanceNames, originalInstanceNames);
});
