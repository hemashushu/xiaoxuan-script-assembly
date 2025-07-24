// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

const apps = [
    { name: "an empty program", input: "proc main() endproc", output: [] },
    { name: "a print statement", input: "proc main() print 8 endproc", output: [8] },
    {
        name: "multiple statements",
        input: "proc main() print 8 print 24 endproc",
        output: [8, 24]
    },
    {
        name: "binary expressions",
        input: "proc main() print(2+ 4) endproc",
        output: [6]
    },
    {
        name: "nested binary expressions",
        input: "proc main() print ((6-4)+10) endproc",
        output: [12]
    },
    {
        name: "variable declaration",
        input: "proc main() var f = 22 print f endproc",
        output: [22]
    },
    {
        name: "variable declaration",
        input: "proc main() var foo = 21 print foo endproc",
        output: [21]
    },
    {
        name: "variable declaration",
        input: "proc main() var a0 = 20 print a0 endproc",
        output: [20]
    },
    {
        name: "floating point variable declaration",
        input: "proc main() var f = 22.5 print f endproc",
        output: [22.5]
    },
    {
        name: "variable assignment",
        input: "proc main() var f = 22 f = (f+1) print f endproc",
        output: [23]
    },
    {
        name: "floating point variable assignment",
        input: "proc main() var f = 22.5 f = (f+1.5) print f endproc",
        output: [24]
    },
    {
        name: "while statements",
        input: "proc main() var f = 0 while (f < 5) f = (f + 1) print f endwhile endproc",
        output: [1, 2, 3, 4, 5]
    },
    {
        name: "setpixel statements",
        input: "proc main() setpixel (1, 2, 3) endproc",
        output: [],
        pixels: [[201, 3]]
    },
    {
        name: "if statement",
        input: `
proc main()
    var f = 5
    if (f < 10)
        print 2
    endif

    if (f >= 10)
        print 3
    endif
endproc
    `,
        output: [2]
    },
    {
        name: "else statement operator",
        input: `
proc main()
    var f = 15
    if (f < 10)
        print 2
    else
        print 3
    endif
endproc
    `,
        output: [3]
    },
    {
        name: "support a single main proc",
        input: `
proc main()
    print 22
endproc
    `,
        output: [22]
    },
    {
        name: "supports procedure invocation",
        input: `
proc foo()
    print 27
endproc

proc main()
    foo()
endproc
    `,
        output: [27]
    },
    {
        name: "supports procedure invocation with arguments",
        input: `
proc foo(f)
    print (f + 1)
endproc

proc main()
    foo(28)
endproc
`,
        output: [29]
    }
];

export default apps;