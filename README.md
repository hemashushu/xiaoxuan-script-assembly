# Script Assembly

Compile TOY language to WebAssembly and run in the browser. The lexer, parser, and code generator are all implemented in pure JavaScript.

## How to Run the Demo

To run this demo in your browser, you need to serve the files using a local web server, since most browsers do not allow loading WebAssembly modules directly from the file system.

For example, to start the Node.js `http-server`, run:

```sh
http-server
```

If you don't have `http-server` package installed, you can install it globally using npm. First, ensure you have Node.js and npm installed on your system. Then, run the following commands:

```sh
# Set npm prefix to avoid permission issues
echo prefix=$HOME/.npm-packages >> ~/.npmrc

# Install http-server globally (for current user)
npm install --global http-server

# Add `--prefix` parameter if you don't want to modify the `~/.npmrc` file, e.g.
# npm install --global --prefix "$HOME/.npm-packages" http-server

# Add npm packages to PATH
# This allows you to run `http-server` command directly
echo PATH=$PATH:$HOME/.npm-packages/bin >> ~/.bashrc
source ~/.bashrc

# Start the server in the current project's root directory
# You can specify a different path if needed, e.g. `http-server /path/to/this/project`
http-server
```

Once the server is running, open `http://localhost:8080/demo/index.html` in your browser to view the demo.

To learn how the demo works, check the [Build your own WebAssembly Compiler](https://blog.scottlogic.com/2019/05/17/webassembly-compiler.html) article, which provides a detailed explanation of the code and its functionality.
