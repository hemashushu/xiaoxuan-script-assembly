// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";

const applyOperator = (operator, left, right) => {
    switch (operator) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return left / right;
        case "==":
            return left == right ? 1 : 0;
        case ">":
            return left > right ? 1 : 0;
        case "<":
            return left < right ? 1 : 0;
        case "&&":
            return left && right;
    }
    throw Error(`Unknown binary operator ${operator}`);
};

export const runtime = async (src, { print, display }) => () => {
    const tokens = tokenize(src);
    const program = parse(tokens);
    const symbols = new Map(); // for variable storage, entry is `{ identifier: value }`

    const evaluateExpression = (expression /* ExpressionNode */) => {
        switch (expression.type) {
            case "numberLiteral":
                return expression.value;
            case "binaryExpression":
                return applyOperator(
                    expression.operator,
                    evaluateExpression(expression.left),
                    evaluateExpression(expression.right)
                );
            case "identifier":
                return symbols.get(expression.value);
        }
    };

    const executeStatements = (statements /* StatementNode[] */) => {
        statements.forEach(statement => {
            switch (statement.type) {
                case "printStatement":
                    print(evaluateExpression(statement.expression));
                    break;
                case "variableDeclaration":
                    symbols.set(
                        statement.name,
                        evaluateExpression(statement.initializer)
                    );
                    break;
                case "variableAssignment":
                    symbols.set(statement.name, evaluateExpression(statement.value));
                    break;
                case "whileStatement":
                    while (evaluateExpression(statement.expression)) {
                        executeStatements(statement.statements);
                    }
                    break;
                case "setpixelStatement":
                    const x = evaluateExpression(statement.x);
                    const y = evaluateExpression(statement.y);
                    const color = evaluateExpression(statement.color);
                    display[y * 100 + x] = color;
                    break;
            }
        });
    };

    executeStatements(program);
};