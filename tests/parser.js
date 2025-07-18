// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { strict as assert } from "node:assert";

import { parse } from "../src/parser.js";

function test_parses_single_statements() {
    const tokens = [
        { type: "keyword", value: "print" },
        { type: "number", value: "22" }
    ];

    const ast = parse(tokens);
    assert.equal(ast.length, 1);
}

function test_parses_multiple_homogenous_statements() {
    const tokens = [
        // print 22
        { type: "keyword", value: "print" },
        { type: "number", value: "22" },
        // print 22
        { type: "keyword", value: "print" },
        { type: "number", value: "22" }
    ];

    const ast = parse(tokens);
    assert.equal(ast.length, 2);
}

function test_parses_print_statement_with_unary_expression() {
    const tokens = [
        {
            type: "keyword",
            value: "print"
        },
        {
            type: "number",
            value: "22"
        }
    ];

    const ast = parse(tokens);
    const node = ast[0];

    assert.deepEqual(node, {
        type: "printStatement",
        expression: { type: "numberLiteral", value: 22 }
    });
}

async function runTests() {
    test_parses_single_statements();
    test_parses_multiple_homogenous_statements();
    test_parses_print_statement_with_unary_expression();

    console.log('🟢 All parser tests passed.');
}

export { runTests };