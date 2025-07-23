// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

import { runtime } from "../src/compiler.js";

const compileButton = document.getElementById("compile");
const codeArea = document.getElementById("code");
const outputArea = document.getElementById("output");
const canvas = document.getElementById("canvas");


// quick and dirty image data scaling
// see: https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas
const scaleImageData = (
    imageData, // ImageData
    scale, // number
    ctx // CanvasRenderingContext2D
) => {
    const scaled = ctx.createImageData(
        imageData.width * scale,
        imageData.height * scale
    );
    const subLine = ctx.createImageData(scale, 1).data;
    for (let row = 0; row < imageData.height; row++) {
        for (let col = 0; col < imageData.width; col++) {
            const sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
            );
            for (let x = 0; x < scale; x++) subLine.set(sourcePixel, x * 4);
            for (let y = 0; y < scale; y++) {
                const destRow = row * scale + y;
                const destCol = col * scale;
                scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4);
            }
        }
    }
    return scaled;
};

const updateCanvas = (display /* Uint8Array */) => {
    const context = canvas.getContext("2d");
    const imgData = context.createImageData(100, 100);
    for (let i = 0; i < 100 * 100; i++) {
        imgData.data[i * 4] = display[i];
        imgData.data[i * 4 + 1] = display[i];
        imgData.data[i * 4 + 2] = display[i];
        imgData.data[i * 4 + 3] = 255;
    }
    const data = scaleImageData(imgData, 3, context);
    context.putImageData(data, 0, 0);
};

const logClear = () => {
    outputArea.value = "";
};

const logMessage = (message) =>
    (outputArea.value = outputArea.value + message + "\n");

const run = async (runtime) => {

    try {
        const display = new Uint8Array(10000); // 100x100 pixels
        const code = codeArea.value;
        const entry = await runtime(code, {
            print: logMessage,
            display
        });

        logClear();
        logMessage(`Executing ... `);

        entry();
        updateCanvas(display);

        logMessage(`Execution finished.`);

    } catch (error) {
        logMessage(error.message);
    }
};

compileButton.addEventListener("click", async () => {
    await run(runtime);
});