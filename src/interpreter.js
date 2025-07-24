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
        case "<":
            return left < right ? 1 : 0;
        case ">":
            return left > right ? 1 : 0;
        case "<=":
            return left <= right ? 1 : 0;
        case ">=":
            return left >= right ? 1 : 0;
        case "&&":
            return left && right;
    }
    throw Error(`Unknown binary operator ${operator}`);
};

const executeProc = (
    node, // ProcStatementNode
    env, // Environment, e.g. `{ print, display }`
    program, // Program
    args //number[]
) => {

    // for local variable storage, entry is `{ identifier: local_variable_index }`
    const symbols = new Map(
        node.args.map((arg, index) => [arg.value, args[index]])
    );

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
                    env.print(evaluateExpression(statement.expression));
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
                case "ifStatement":
                    if (evaluateExpression(statement.expression)) {
                        executeStatements(statement.consequent);
                    } else {
                        executeStatements(statement.alternate);
                    }
                    break;
                case "callStatement":
                    if (statement.name === "setpixel") {
                        const x = evaluateExpression(statement.args[0]);
                        const y = evaluateExpression(statement.args[1]);
                        const color = evaluateExpression(statement.args[2]);
                        env.display[y * 100 + x] = color;
                    } else {
                        const procName = statement.name;
                        const argValues = statement.args.map(arg =>
                            evaluateExpression(arg)
                        );
                        const proc = program.find(f => f.name === procName);
                        executeProc(proc, env, program, argValues);
                    }
                    break;
            }
        });
    };

    executeStatements(node.statements);
};

export const runtime = async (src, env) => () => {
    const tokens = tokenize(src);
    const program = parse(tokens);
    const main = program.find(f => f.name === "main");

    executeProc(main, env, program);
};