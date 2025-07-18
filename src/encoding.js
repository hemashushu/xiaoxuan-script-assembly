// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

export const ieee754 = (n) => {
    // See:
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat32
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/Uint8Array
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setFloat32(0, n, true); // `setFloat32(byteOffset, value, littleEndian)`
    const bytes = new Uint8Array(buf); // `new Uint8Array(buffer, byteOffset, length)`
    return bytes;
};

export const encodeString = (str) => [
    str.length,
    ...str.split("").map(s => s.charCodeAt(0))
];

export const signedLEB128 = (n) => {
    const buffer = [];
    let more = true;
    while (more) {
        let byte = n & 0x7f;
        n >>>= 7;
        if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0)) {
            more = false;
        } else {
            byte |= 0x80;
        }
        buffer.push(byte);
    }
    return buffer;
};

export const unsignedLEB128 = (n) => {
    const buffer = [];
    do {
        let byte = n & 0x7f;
        n >>>= 7;
        if (n !== 0) {
            byte |= 0x80;
        }
        buffer.push(byte);
    } while (n !== 0);
    return buffer;
};