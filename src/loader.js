// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { runtime } from "./compiler.js";

async function executeCode(code /* string */) {
    const output = document.querySelector("#output");

    const entry = await runtime(code, {
        print: data => output.textContent += `${data}\n`,
    });

    entry();
}

async function loadScripts() {
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

        console.log(`Executing script: ${script.id || "anonymous"}`);
        console.log(`====\n${code}\n===`);

        await executeCode(code);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadScripts();
});

// If you want to run this in a browser, ensure you have a server running to serve the files,
// as WebAssembly modules cannot be loaded from the file system directly in most browsers.
//
// To run the server, you can use the command:
//
// ```sh
// export PATH=$PATH:${HOME}/.npm-packages/bin
// echo "prefix=/home/yang/.npm-packages" >> ~/.npmrc # Optional
// npm install --global --prefix ${HOME}/.npm-packages http-server
// http-server [path] [options]
// ```
//
// Now you can visit http://localhost:8080/demo.html to view your server
