# How to Run the Demo

To run this demo in your browser, you need to serve the files using a local web server. Most browsers do not allow loading WebAssembly modules directly from the file system.

To start a server, use the following commands:

```sh
# Set npm prefix to avoid permission issues
echo prefix=$HOME/.npm-packages >> ~/.npmrc

# Install http-server globally (for current user)
# Add `--prefix` parameter if you don't want to modify the `~/.npmrc` file, e.g.
# npm install --global --prefix "$HOME/.npm-packages" http-server
npm install --global http-server

# Add npm packages to PATH
# This allows you to run `http-server` command directly
echo PATH=$PATH:$HOME/.npm-packages/bin >> ~/.bashrc
source ~/.bashrc

# Start the server in the current directory
# You can specify a different path if needed, e.g. `http-server /path/to/demo`
http-server
```

Once the server is running, open [http://localhost:8080/demo.html](http://localhost:8080/demo.html) in your browser to view the demo.
