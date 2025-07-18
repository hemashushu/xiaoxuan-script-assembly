// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

const apps = [
    { name: "an empty program", input: "", output: [] },
    { name: "a print statement", input: "print 8", output: [8] },
    {
        name: "multiple statements",
        input: "print 8 print 24",
        output: [8, 24]
    }
];

export default apps;