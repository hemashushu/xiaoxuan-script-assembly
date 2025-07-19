// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { strict as assert } from "node:assert";

import { tokenize } from "../src/tokenizer.js";

function test_copes_with_a_single_token() {
    const input = " print";
    const tokens = tokenize(input);
    assert.equal(tokens.length, 1);
    assert.equal(tokens[0].type, "keyword");
}

function test_copeswith_multiple_tokens() {
    const input = " printprint";
    const tokens = tokenize(input);
    assert.equal(tokens.length, 2);
}

function test_consumes_whitespace() {
    const input = " print    print";
    const tokens = tokenize(input);
    assert.equal(tokens.length, 2);
}

function test_barfson_unrecognized_token() {
    assert.throws(() => {
        const input = " print $ print";
        tokenize(input);
    }, {
        message: "Unexpected token $"
    });
}

function test_copeswith_multiple_mixed_tokens() {
    const input = " print 2";
    const tokens = tokenize(input);
    assert.equal(tokens.length, 2);
    assert.equal(tokens[0].type, "keyword");
    assert.equal(tokens[1].type, "number");
}

function runTests() {
    test_copes_with_a_single_token();
    test_copeswith_multiple_tokens();
    test_consumes_whitespace();
    test_barfson_unrecognized_token();
    test_copeswith_multiple_mixed_tokens();

    console.log('🟢 All tokenizer tests passed.');
}

export { runTests };