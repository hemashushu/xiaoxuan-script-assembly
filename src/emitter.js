// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { unsignedLEB128, signedLEB128, encodeString, ieee754 } from "./encoding.js";
import post_order_traverse from "./traverse.js";

const flatten = (arr /* Array */) => [].concat.apply([], arr);

// https://webassembly.github.io/spec/core/binary/modules.html#sections
const Section = Object.freeze({
    custom: 0,
    type: 1,
    import: 2,
    func: 3,
    table: 4,
    memory: 5,
    global: 6,
    export: 7,
    start: 8,
    element: 9,
    code: 10,
    data: 11
});

// https://webassembly.github.io/spec/core/binary/types.html
const Valtype = Object.freeze({
    i32: 0x7f,
    f32: 0x7d
});

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
const Blocktype = Object.freeze({
    void: 0x40
});

// https://webassembly.github.io/spec/core/binary/instructions.html
// https://developer.mozilla.org/en-US/docs/WebAssembly/Reference
const Opcodes = Object.freeze({
    block: 0x02,
    loop: 0x03,
    br: 0x0c,
    br_if: 0x0d,
    end: 0x0b,
    call: 0x10,
    get_local: 0x20,
    set_local: 0x21,
    i32_store_8: 0x3a,
    i32_const: 0x41,
    f32_const: 0x43,
    i32_eqz: 0x45,
    i32_eq: 0x46,
    f32_eq: 0x5b,
    f32_lt: 0x5d,
    f32_gt: 0x5e,
    f32_le: 0x5f,
    f32_ge: 0x60,
    i32_and: 0x71,
    f32_add: 0x92,
    f32_sub: 0x93,
    f32_mul: 0x94,
    f32_div: 0x95,
    i32_trunc_f32_s: 0xa8
});

const binaryOpcode = {
    "+": Opcodes.f32_add,
    "-": Opcodes.f32_sub,
    "*": Opcodes.f32_mul,
    "/": Opcodes.f32_div,
    "==": Opcodes.f32_eq,
    "<": Opcodes.f32_lt,
    ">": Opcodes.f32_gt,
    "<=": Opcodes.f32_le,
    ">=": Opcodes.f32_ge,
    "&&": Opcodes.i32_and
};


// http://webassembly.github.io/spec/core/binary/modules.html#export-section
const ExportType = Object.freeze({
    func: 0x00,
    table: 0x01,
    mem: 0x02,
    global: 0x03
});

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60;

const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
const encodeVector = (data /* Array */) => [
    ...unsignedLEB128(data.length),
    ...flatten(data)
];

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
const encodeLocal = (count, type /* Valtype */) => [
    ...unsignedLEB128(count),
    type
];

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
const createSection = (sectionType /* Section */, data /* Array */) => [
    sectionType,
    ...encodeVector(data)
];

const codeFromProc = (node /* ProcStatementNode */, program) => {
    const code = [];

    // for local variable storage, entry is `{ identifier: local_variable_index }`
    const symbols = new Map(
        node.args.map((arg, index) => [arg.value, index])
    );

    const localIndexForSymbol = (name) => {
        if (!symbols.has(name)) {
            symbols.set(name, symbols.size);
        }
        return symbols.get(name);
    };

    const emitExpression = (node /* ExpressionNode */) =>
        post_order_traverse(node, (node) => {
            switch (node.type) {
                case "numberLiteral":
                    code.push(Opcodes.f32_const);
                    code.push(...ieee754(node.value));
                    break;
                case "identifier":
                    code.push(Opcodes.get_local);
                    code.push(...unsignedLEB128(localIndexForSymbol(node.value)));
                    break;
                case "binaryExpression":
                    code.push(binaryOpcode[node.operator]);
                    break;
            }
        });

    const emitStatements = (statements) =>
        statements.forEach(statement => {
            switch (statement.type) {
                case "printStatement":
                    emitExpression(statement.expression);
                    code.push(Opcodes.call);
                    code.push(...unsignedLEB128(0)); /* function index 0 */
                    break;
                case "variableDeclaration":
                    emitExpression(statement.initializer);
                    code.push(Opcodes.set_local);
                    code.push(...unsignedLEB128(localIndexForSymbol(statement.name)));
                    break;
                case "variableAssignment":
                    emitExpression(statement.value);
                    code.push(Opcodes.set_local);
                    code.push(...unsignedLEB128(localIndexForSymbol(statement.name)));
                    break;
                case "whileStatement":
                    /*
                    Generates a loop structure.

                    For example, the following code:

                    ```
                    var f = 0
                    while (f < 10)
                        print f
                        f = (f + 1)
                    endwhile
                    ```

                    can be translated to the corresponding WASM structure:

                    ```wat
                    (block
                        (loop
                            ;; [loop condition]
                            i32.eqz
                            ;; [nested statements]
                            br_if 1 ;; Exit loop if condition is false
                            br 0    ;; Repeat loop
                        )
                    )
                    ```
                    */

                    // outer block
                    code.push(Opcodes.block);
                    code.push(Blocktype.void);
                    // inner loop
                    code.push(Opcodes.loop);
                    code.push(Blocktype.void);
                    // compute the while expression
                    emitExpression(statement.expression);
                    code.push(Opcodes.i32_eqz);
                    // br_if $label0
                    code.push(Opcodes.br_if);
                    code.push(...signedLEB128(1));
                    // the nested logic
                    emitStatements(statement.statements);
                    // br $label1
                    code.push(Opcodes.br);
                    code.push(...signedLEB128(0));
                    // end loop
                    code.push(Opcodes.end);
                    // end block
                    code.push(Opcodes.end);
                    break;
                case "ifStatement":
                    // if block
                    code.push(Opcodes.block);
                    code.push(Blocktype.void);
                    // compute the if expression
                    emitExpression(statement.expression);
                    code.push(Opcodes.i32_eqz);
                    // br_if $label0
                    code.push(Opcodes.br_if);
                    code.push(...signedLEB128(0));
                    // the nested logic
                    emitStatements(statement.consequent);
                    // end block
                    code.push(Opcodes.end);

                    // else block
                    code.push(Opcodes.block);
                    code.push(Blocktype.void);
                    // compute the if expression
                    emitExpression(statement.expression);
                    code.push(Opcodes.i32_const);
                    code.push(...signedLEB128(1));
                    code.push(Opcodes.i32_eq);
                    // br_if $label0
                    code.push(Opcodes.br_if);
                    code.push(...signedLEB128(0));
                    // the nested logic
                    emitStatements(statement.alternate);
                    // end block
                    code.push(Opcodes.end);
                    break;
                case "callStatement":
                    if (statement.name === "setpixel") {
                        // compute and cache the setpixel parameters
                        emitExpression(statement.args[0]);
                        code.push(Opcodes.set_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("x")));
                        emitExpression(statement.args[1]);
                        code.push(Opcodes.set_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("y")));
                        emitExpression(statement.args[2]);
                        code.push(Opcodes.set_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("color")));
                        // compute the offset (x * 100) + y
                        code.push(Opcodes.get_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("y")));
                        code.push(Opcodes.f32_const);
                        code.push(...ieee754(100));
                        code.push(Opcodes.f32_mul);
                        code.push(Opcodes.get_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("x")));
                        code.push(Opcodes.f32_add);
                        // convert to an integer
                        code.push(Opcodes.i32_trunc_f32_s);
                        // fetch the color
                        code.push(Opcodes.get_local);
                        code.push(...unsignedLEB128(localIndexForSymbol("color")));
                        code.push(Opcodes.i32_trunc_f32_s);
                        // write
                        code.push(Opcodes.i32_store_8);
                        code.push(...[0x00, 0x00]); // align and offset
                    } else {
                        statement.args.forEach(arg => {
                            emitExpression(arg);
                        });
                        const index = program.findIndex(f => f.name === statement.name);
                        code.push(Opcodes.call);
                        code.push(...unsignedLEB128(index + 1));
                    }
                    break;
            }
        });

    emitStatements(node.statements);

    // currently, only f32 type local variables are supported.
    const localCount = symbols.size;
    const locals = localCount > 0 ? [encodeLocal(localCount, Valtype.f32)] : [];
    return encodeVector([...encodeVector(locals), ...code, Opcodes.end]);

};

export const emitter = (ast /* Program */) => {
    // Function types are vectors of parameters and return types. Currently
    // WebAssembly only supports single return values

    const printFunctionType = [
        functionType,
        ...encodeVector([Valtype.f32]),
        emptyArray
    ];

    // TODO: optimise - some of the procs might have the same type signature
    const funcTypes = ast.map(proc => [
        functionType,
        ...encodeVector(proc.args.map(_ => Valtype.f32)),
        emptyArray
    ]);

    // the type section is a vector of function types
    const typeSection = createSection(
        Section.type,
        encodeVector([printFunctionType, ...funcTypes])
    );

    // the function section is a vector of type indices that indicate the type of each function
    // in the code section
    const funcSection = createSection(
        Section.func,
        encodeVector(ast.map((_, index) => index + 1 /* type index */))
    );

    // the import section is a vector of imported functions
    const printFunctionImport = [
        ...encodeString("env"), // module name
        ...encodeString("print"), // function name
        ExportType.func, // export type
        0x00 // type index
    ];

    const memoryImport = [
        ...encodeString("env"),
        ...encodeString("memory"),
        ExportType.mem,
        /* limits https://webassembly.github.io/spec/core/binary/types.html#limits -
          indicates a min memory size of one page */
        0x00,
        0x01
    ];

    const importSection = createSection(
        Section.import,
        encodeVector([printFunctionImport, memoryImport])
    );

    // the export section is a vector of exported functions
    const exportSection = createSection(
        Section.export,
        encodeVector([
            [
                ...encodeString("run"), // the entry point function name
                ExportType.func, // export type
                ast.findIndex(a => a.name === "main") + 1 // function public index
            ]
        ])
    );

    const codeSection = createSection(
        Section.code,
        encodeVector(ast.map(a => codeFromProc(a, ast)))
    );

    return Uint8Array.from([
        ...magicModuleHeader,
        ...moduleVersion,
        ...typeSection,
        ...importSection,
        ...funcSection,
        ...exportSection,
        ...codeSection
    ]);
};

