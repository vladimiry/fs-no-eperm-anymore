import {test} from "ava";

import {instance, originalInstance} from "dist/index"; // importing the built/final code

test("types of the exported items", async (t) => {
    const customInstance = instance();

    t.is(typeof instance, "function", "\"instance\" is a function");
    t.is(typeof customInstance, "object", "instantiated thing is an object");
    t.is(typeof originalInstance, "object", "\"originalInstance\" is an object");
});

test("mounting function to the instance", async (t) => {
    const customInstance = instance();

    const originalInstanceNames = Object.keys(originalInstance);
    const customInstanceNames = Object.keys(customInstance);

    originalInstanceNames.sort();
    customInstanceNames.sort();

    t.deepEqual(customInstanceNames, originalInstanceNames);
});
