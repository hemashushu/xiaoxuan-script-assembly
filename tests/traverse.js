// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { strict as assert } from "node:assert";

import post_order_traverse from "../src/traverse.js";

function traverse(ast) {
    const visited = [];
    const visitor = node => visited.push(node.value);
    post_order_traverse(ast, visitor);
    return visited;
}

function test_traverses_post_order_visiting_leaves_first() {
    const ast = {
        type: "unary_expression",
        value: "minus",
        expression: {
            type: "number",
            value: 42
        }
    };

    const visited = traverse(ast);
    assert.deepEqual(visited, [42, "minus"]);
}

function test_traverses_array_properties() {
    const ast = {
        type: "binary_expression",
        value: "+",
        expressions: [
            {
                type: "number",
                value: 11
            },
            {
                type: "number",
                value: 13
            }
        ]
    };

    const visited = traverse(ast);
    assert.deepEqual(visited, [11, 13, "+"]);
}

function test_traverses_array_root() {
    const ast = [
        {
            type: "number",
            value: 11
        },
        {
            type: "number",
            value: 13
        }
    ];

    const visited = traverse(ast);
    assert.deepEqual(visited, [11, 13]);
}


function runTests() {
    test_traverses_post_order_visiting_leaves_first();
    test_traverses_array_properties();
    test_traverses_array_root();

    console.log('🟢 All traverse tests passed.');
}

export { runTests };