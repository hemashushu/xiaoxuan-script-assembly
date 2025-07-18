// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { runTests as test_tokenizer } from "./tokenizer.js";
import { runTests as test_parser } from "./parser.js";
import { runTests as test_apps_interpreter } from "./interpreter.js";
import { runTests as test_apps_compiler } from "./compiler.js";

async function runTests() {
    test_tokenizer();
    test_parser();
    await test_apps_interpreter();
    await test_apps_compiler();

    console.log("✅ All tests passed.");
}

runTests();