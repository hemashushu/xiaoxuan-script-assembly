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

export const runtime = async (src, env) => {
    const buffer = compile(src);
    const result = await WebAssembly.instantiate(buffer, {
        env
    });
    return () => {
        result.instance.exports.run();
    };
};