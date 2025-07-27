# vscode-notify

Send notifications to VS Code from your terminal! This extension allows you to display notifications in VS Code from any terminal or external process.

## Features

- Send notifications to VS Code from the terminal
- Support for different notification types (info, warning, error)
- Automatic port management for multiple VS Code instances
- Works with any workspace

## Installation

### Extension Installation

1. Install the extension from VS Code marketplace or from source:
   ```bash
   # From source
   npm install
   npm run compile
   ```

2. The extension activates automatically when VS Code starts

### CLI Installation

#### Global Installation (Recommended)
```bash
npm install -g .
```

#### Local Installation
```bash
npm link
```

## Usage

### Basic Usage

Send a simple notification:
```bash
vscode-notify "Build completed successfully"
```

### Notification Types

Send different types of notifications:
```bash
# Information (default)
vscode-notify "Process started"

# Warning
vscode-notify --type warning "Low disk space"

# Error
vscode-notify --type error "Build failed!"
```

### Advanced Usage

```bash
# Send to specific port
vscode-notify --port 7532 "Custom port notification"

# Send to all running VS Code instances
vscode-notify --all "Broadcast message"

# Show help
vscode-notify --help
```

## How It Works

1. The VS Code extension starts an HTTP server on a dynamic port (7531-7540)
2. Port information is saved to `.vscode/vscode-notify-port.json` in your workspace
3. The CLI tool reads this file to find the correct port
4. Notifications are sent via HTTP POST requests

## Multiple VS Code Instances

The extension handles multiple VS Code instances automatically:
- Each instance gets its own port
- The CLI tool finds the correct instance based on your current directory
- Use `--port` to target a specific instance
- Use `--all` to notify all instances

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test
```

## Troubleshooting

If notifications aren't working:
1. Ensure the extension is installed and activated
2. Check VS Code's output panel for error messages
3. Verify the port file exists: `.vscode/vscode-notify-port.json`
4. Try using the `--port` flag with the default port: `vscode-notify --port 7531 "Test"`

## License

MIT
