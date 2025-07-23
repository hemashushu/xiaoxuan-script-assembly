// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

const TokenType = Object.freeze({
    "number": "number",
    "keyword": "keyword",
    "whitespace": "whitespace",
    "parens": "parens",
    "operator": "operator",
    "identifier": "identifier",
    "assignment": "assignment"
});

export const keywords = ["print", "var", "while", "endwhile", "setpixel"];

export const operators = ["+", "-", "*", "/", "==", "<", ">", "&&"];

const escapeRegEx = (text) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

export class TokenizerError extends Error {
    index;
    constructor(message, index) {
        super(message);
        this.index = index;
    }
};

// returns a token if the given regex matches at the current index
const regexMatcher = (regex, type /* TokenType */) /* -> Matcher */ => (
    input,
    index
) => {
    const match = input.substring(index).match(regex);
    return (
        match && {
            type,
            value: match[0]
        }
    );
};

// matchers in precedence order
const matchers = [
    regexMatcher("^[.0-9]+", "number"),
    regexMatcher(`^(${keywords.join("|")})`, "keyword"),
    regexMatcher("^\\s+", "whitespace"),
    regexMatcher(`^(${operators.map(escapeRegEx).join("|")})`, "operator"),
    regexMatcher(`^[a-z]`, "identifier"),
    regexMatcher(`^=`, "assignment"),
    regexMatcher("^[()]{1}", "parens")
];

const locationForIndex = (input, index) => ({
    column: index - input.lastIndexOf("\n", index) - 1,
    line: input.substring(0, index).split("\n").length - 1
});

export const tokenize = input => {
    const tokens /* Token[] */ = [];
    let index = 0;
    while (index < input.length) {
        const matches = matchers.map(m => m(input, index)).filter(f => f);
        if (matches.length > 0) {
            // take the highest priority match
            const match = matches[0];
            if (match.type !== "whitespace") {
                // class Token {
                //     type;
                //     value;
                //     line;
                //     column;
                // }
                tokens.push({ ...match, ...locationForIndex(input, index) });
            }
            index += match.value.length;
        } else {
            throw new TokenizerError(
                `Unexpected token ${input.substring(index, index + 1)}`,
                index
            );
        }
    }
    return tokens;
};