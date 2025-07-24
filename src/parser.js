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
    let nextToken = tokenIterator.next().value;

    const isCurrentTokenKeyword = (name) =>
        currentToken.value === name && currentToken.type === "keyword";

    const eatToken = (value /* optional */) => {
        if (value !== undefined && value !== currentToken.value) {
            throw new ParserError(
                `Unexpected token value, expected ${value}, received ${currentToken.value
                }`,
                currentToken
            );
        }
        currentToken = nextToken;
        nextToken = tokenIterator.next().value;
    };

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

            case "identifier":
                node = { type: "identifier", value: currentToken.value };
                eatToken();
                return node;

            case "parens":
                eatToken("(");
                const left = parseExpression();
                const operator = currentToken.value;
                eatToken();
                const right = parseExpression();
                eatToken(")");
                return {
                    type: "binaryExpression",
                    left,
                    right,
                    operator
                };

            default:
                console.log(tokens);
                throw new ParserError(
                    `Unexpected token type ${currentToken.type}`,
                    currentToken
                );
        }
    };

    const parsePrintStatement = () => {
        eatToken("print");
        return {
            type: "printStatement",
            expression: parseExpression()
        };
    };

    const parseIfStatement = () => {
        eatToken("if");

        const expression = parseExpression();

        let elseStatements = false;
        const consequent = [];
        const alternate = [];
        while (!isCurrentTokenKeyword("endif")) {
            if (isCurrentTokenKeyword("else")) {
                eatToken("else");
                elseStatements = true;
            }
            if (elseStatements) {
                alternate.push(parseStatement());
            } else {
                consequent.push(parseStatement());
            }
        }

        eatToken("endif");

        return { type: "ifStatement", expression, consequent, alternate };
    };

    const parseWhileStatement = () => {
        eatToken("while");

        const expression = parseExpression();

        const statements = [];
        while (!isCurrentTokenKeyword("endwhile")) {
            statements.push(parseStatement());
        }

        eatToken("endwhile");

        return { type: "whileStatement", expression, statements };
    };

    const parseVariableAssignment = () => {
        const name = currentToken.value;
        eatToken();
        eatToken("=");
        return { type: "variableAssignment", name, value: parseExpression() };
    };

    const parseVariableDeclarationStatement = () => {
        eatToken("var");
        const name = currentToken.value;
        eatToken();
        eatToken("=");
        return {
            type: "variableDeclaration",
            name,
            initializer: parseExpression()
        };
    };

    const parseCallStatementNode = () => {
        const name = currentToken.value;
        eatToken();

        const args = parseCommaSeperatedList(() => parseExpression());
        return {
            type: "callStatement",
            name,
            args
        };
    };

    function parseCommaSeperatedList(parseArgument) {
        const args = [];
        eatToken("(");
        while (currentToken.value !== ")") {
            args.push(parseArgument());
            if (currentToken.value !== ")") {
                eatToken(",");
            }
        }
        eatToken(")");
        return args;
    }

    const parseProcStatement = () => {
        eatToken("proc");

        const name = currentToken.value;
        eatToken();

        const args = parseCommaSeperatedList(() => {
            const arg = { type: "identifier", value: currentToken.value };
            eatToken();
            return arg;
        });

        const statements = [];
        while (!isCurrentTokenKeyword("endproc")) {
            statements.push(parseStatement());
        }
        eatToken("endproc");

        return {
            type: "procStatement",
            name,
            args,
            statements
        };
    };

    const parseStatement = () => {
        if (currentToken.type === "keyword") {
            switch (currentToken.value) {
                case "print":
                    return parsePrintStatement();
                case "var":
                    return parseVariableDeclarationStatement();
                case "while":
                    return parseWhileStatement();
                case "if":
                    return parseIfStatement();
                default:
                    throw new ParserError(
                        `Unknown keyword ${currentToken.value}`,
                        currentToken
                    );
            }
        } else if (currentToken.type === "identifier") {
            if (nextToken.value === "=") {
                return parseVariableAssignment();
            } else {
                return parseCallStatementNode();
            }
        }
    };

    const nodes /* ProcStatementNode[] */ = [];
    while (currentToken) {
        nodes.push(parseProcStatement());
    }

    return nodes;
};