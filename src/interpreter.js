// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";

export const runtime = async (src, { print }) => () => {
    const tokens = tokenize(src);
    const program = parse(tokens);

    const evaluateExpression = (expression /* ExpressionNode */) => {
        switch (expression.type) {
            case "numberLiteral":
                return expression.value;
        }
    };

    const executeStatements = (statements /* StatementNode[] */) => {
        statements.forEach(statement => {
            switch (statement.type) {
                case "printStatement":
                    print(evaluateExpression(statement.expression));
                    break;
            }
        });
    };

    executeStatements(program);
};