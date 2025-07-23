// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { strict as assert } from "node:assert";

import { runtime } from "../src/compiler.js";

import apps from "./apps.js";

// execute the app, recording print statements and pixel writes
const executeCode = async (code /* string */) => {
    const output = [];
    const pixels = [];
    const display = new Uint8Array(10000); // 100x100 display

    const entry = await runtime(code, {
        print: d => output.push(d),
        display
    });

    entry();

    // find any pixels that have been written to
    display.forEach((value, index) => {
        if (value !== 0) {
            pixels.push([index, value]);
        }
    });

    return { output, pixels };
};

async function runTests() {
    for (const app of apps) {
        console.log(`Running app ${app.name} with compiler`);
        const result = await executeCode(app.input);
        assert.deepEqual(result.output, app.output);

        if (app.pixels || result.pixels.length) {
            assert.deepEqual(result.pixels, app.pixels);
        }
    }

    console.log("🟢 All apps with compiler passed.");
}

export { runTests };