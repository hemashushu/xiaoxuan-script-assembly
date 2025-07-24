// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { strict as assert } from "node:assert";

import { parse } from "../src/parser.js";

function test_parses_single_statements() {
    const tokens = [
        { type: "keyword", value: "proc" },
        { type: "identifier", value: "main" },
        { type: "parens", value: "(" },
        { type: "parens", value: ")" },
        { type: "keyword", value: "print" },
        { type: "number", value: "22" },
        { type: "keyword", value: "endproc" }
    ];

    const ast = parse(tokens);
    assert.equal(ast.length, 1);

    const node = ast[0];
    assert.deepEqual(node, {
        type: "procStatement",
        name: "main",
        args: [],
        statements: [
            {
                type: "printStatement",
                expression: { type: "numberLiteral", value: 22 }
            }
        ]
    });
}

function test_parses_proc_with_single_arg() {
    const tokens = [
        { type: "keyword", value: "proc" },
        { type: "identifier", value: "fish" },
        { type: "parens", value: "(" },
        { type: "identifier", value: "foo" },
        { type: "parens", value: ")" },
        { type: "keyword", value: "endproc" }
    ];

    const ast = parse(tokens);
    assert.equal(ast.length, 1);

    const node = ast[0];
    assert.deepEqual(node, {
        type: "procStatement",
        name: "fish",
        args: [
            {
                type: "identifier",
                value: "foo"
            }
        ],
        statements: []
    });
}

function test_parses_multiple_homogenous_statements() {
    const tokens = [
        { type: "keyword", value: "proc" },
        { type: "identifier", value: "main" },
        { type: "parens", value: "(" },
        { type: "parens", value: ")" },
        // print 11
        { type: "keyword", value: "print" },
        { type: "number", value: "11" },
        // print 13
        { type: "keyword", value: "print" },
        { type: "number", value: "13" },
        { type: "keyword", value: "endproc" }
    ];

    const ast = parse(tokens);
    assert.equal(ast.length, 1);

    const node = ast[0];
    assert.deepEqual(node, {
        type: "procStatement",
        name: "main",
        args: [],
        statements: [
            {
                type: "printStatement",
                expression: { type: "numberLiteral", value: 11 }
            },
            {
                type: "printStatement",
                expression: { type: "numberLiteral", value: 13 }
            }
        ]
    });
}

async function runTests() {
    test_parses_proc_with_single_arg();
    test_parses_single_statements();
    test_parses_multiple_homogenous_statements();

    console.log('🟢 All parser tests passed.');
}

export { runTests };