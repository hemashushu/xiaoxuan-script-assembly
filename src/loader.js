// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { runtime } from "./compiler.js";

async function executeCode(code /* string */) {

    const display = new Uint8Array(10000); // 100x100 pixels

    const entry = await runtime(code, {
        print: data => console.log(data),
        display
    });

    entry();
}

async function loadAndRunEmbeddedScripts() {
    let scripts = document.querySelectorAll("script[type='text/xiaoxuan-script']");

    if (scripts.length === 0) {
        console.warn("No scripts found with type 'text/xiaoxuan-script'.");
    }

    for (let script of scripts) {
        const code = script.textContent.trim();
        if (code === "") {
            console.warn(`Script with id '${script.id}' is empty.`);
            continue;
        }
        await executeCode(code);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAndRunEmbeddedScripts();
});
