// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

/*
 * NOTE:
 *
 * These code (tokenizer.js, parser.js, interpreter.js, compiler.js,
 * and emitter.js) are copied from the tutorial:
 * "Build your own WebAssembly Compiler" by Colin Eberhardt
 * See:
 * https://blog.scottlogic.com/2019/05/17/webassembly-compiler.html
 * https://github.com/ColinEberhardt/chasm
 */

export class ParserError extends Error {
    token /* Token */;
    constructor(message, token) {
        super(message);
        this.token = token;
    }
}

export const parse = tokens => {
    const tokenIterator = tokens[Symbol.iterator]();
    let currentToken = tokenIterator.next().value;

    const eatToken = () => (currentToken = tokenIterator.next().value);

    const parseExpression = () => {
        let node /* ExpressionNode */;
        switch (currentToken.type) {
            case "number":
                node = {
                    type: "numberLiteral",
                    value: Number(currentToken.value)
                };
                eatToken();
                return node;
        }
    };

    const parseStatement = () => {
        if (currentToken.type === "keyword") {
            switch (currentToken.value) {
                case "print":
                    eatToken();
                    return {
                        type: "printStatement",
                        expression: parseExpression()
                    };
            }
        }
    };

    const nodes /* StatementNode[] */ = [];
    while (currentToken) {
        nodes.push(parseStatement());
    }

    return nodes;
};