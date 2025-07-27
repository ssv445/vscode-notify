# vscode-notify

Send desktop notifications from your terminal that can focus specific VS Code instances! This extension displays native OS notifications that appear outside of VS Code and allow you to quickly switch to the relevant workspace.

## Features

- **Desktop notifications**: Native OS notifications that appear in your system's notification center
- **Click-to-focus**: Clicking a notification brings the relevant VS Code window to the front
- **Multi-workspace awareness**: Each notification knows which VS Code instance it came from
- **Background visibility**: Notifications appear even when VS Code is minimized or in the background
- **Cross-platform**: Works on macOS, Windows, and Linux
- **Automatic port management**: Handles multiple VS Code instances without conflicts

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
5. The extension displays native desktop notifications using your OS's notification system
6. Clicking a notification focuses the specific VS Code window that received the notification

## Multiple VS Code Instances

The extension handles multiple VS Code instances automatically:
- Each instance gets its own port and shows notifications with the workspace name
- The CLI tool finds the correct instance based on your current directory
- Clicking any notification focuses the specific VS Code window that triggered it
- Use `--port` to target a specific instance
- Use `--all` to notify all instances

### Example Workflow
1. You have VS Code open with "Project A" and "Project B"
2. In Project A's terminal: `vscode-notify "Build completed"`
3. A desktop notification appears titled "ℹ️ Project A"
4. Even if you're working in Project B, clicking the notification switches focus to Project A

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
