// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { emitter } from "./emitter.js";

export const compile = src => {
    const tokens = tokenize(src);
    const ast = parse(tokens);
    const buffer = emitter(ast);
    return buffer;
};

export const runtime = async (src, env /* Import Object `{key1: ..., key2: ...}` */) => {
    const bufferSource = compile(src);

    // Optional
    //
    // ```
    // const module = WebAssembly.compile(bufferSource, compileOptions);
    // ```
    //
    // See:
    // https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/compile_static

    // Syntax:
    // Taking Wasm binary code
    // - `WebAssembly.instantiate(bufferSource)`
    // - `WebAssembly.instantiate(bufferSource, importObject)`
    // - `WebAssembly.instantiate(bufferSource, importObject, compileOptions)`
    //
    // Taking a module object instance
    // - `WebAssembly.instantiate(module)`
    // - `WebAssembly.instantiate(module, importObject)`
    // - `WebAssembly.instantiate(module, importObject, compileOptions)`
    //
    //
    // compileOptions
    // --------------
    // An object containing compilation options. Properties can include:
    //
    // - `builtins`
    //     An array of strings that enables the usage of JavaScript builtins
    //     in the compiled Wasm module. The strings define the builtins
    //     you want to enable. Currently the only available value is "js-string",
    //     which enables JavaScript string builtins.
    //
    // - `importedStringConstants`
    //     A string specifying a namespace for imported global string constants.
    //     This property needs to be specified if you wish to use
    //     imported global string constants in the Wasm module.
    //
    // Return value
    // ------------
    // If a bufferSource is passed, returns a Promise that resolves to a ResultObject
    // which contains two fields:
    //
    // - module: A WebAssembly.Module object representing the compiled WebAssembly module.
    //   This Module can be instantiated again, shared via postMessage(), or cached.
    // - instance: A WebAssembly.Instance object that contains all the Exported WebAssembly functions.
    //
    // If a module is passed, returns a Promise that resolves to an WebAssembly.Instance object.
    //
    // See:
    // https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiate_static

    const memory = new WebAssembly.Memory({ initial: 1 });

    const result = await WebAssembly.instantiate(bufferSource, {
        env: {
            ...env,
            memory
        }
    });

    return () => {
        result.instance.exports.run();
        env.display.set(new Uint8Array(memory.buffer, 0, 10000));
    };
};