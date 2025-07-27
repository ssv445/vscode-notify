# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vscode-notify-desktop is a VS Code extension that aims to show notifications in VS Code from the terminal. Currently, it's a minimal extension scaffold that needs to be developed to implement its core functionality.

## Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run compile

# Watch mode for development (auto-compile on changes)
npm run watch

# Run linter
npm run lint

# Run tests
npm test

# Build before publishing
npm run vscode:prepublish
```

## Architecture

The extension implements terminal-to-desktop notifications using an HTTP server approach with native OS notifications:

- **Entry Point**: `src/extension.ts` - Contains `activate()` and `deactivate()` functions
- **HTTP Server**: Runs on localhost with dynamic port allocation (7531-7540)
- **Desktop Notifications**: Uses `node-notifier` for native OS notifications
- **Click Handlers**: Notifications focus VS Code window when clicked
- **Port Discovery**: Writes port info to `.vscode/vscode-notify-desktop-port.json` in workspace
- **CLI Tool**: `cli/vscode-notify-desktop.js` - Node.js script that sends HTTP requests
- **Compilation**: TypeScript files in `src/` compile to JavaScript in `out/`

Key components:
1. **Dynamic Port Allocation**: Handles multiple VS Code instances by finding available ports
2. **Native Desktop Notifications**: Shows notifications in OS notification center using node-notifier
3. **Workspace Identification**: Each notification includes workspace name and can focus the correct window
4. **Click-to-Focus**: Clicking notifications executes VS Code commands to focus the window
5. **Process Validation**: Checks if VS Code process is still running before using cached port
6. **Cross-platform Support**: Works on macOS, Windows, and Linux notification systems

## Testing

To test the extension during development:
1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Run commands from the Command Palette (Ctrl/Cmd+Shift+P)

To run the test suite:
```bash
npm test
```

## TypeScript Configuration

- Target: ES2022
- Module: Node16  
- Strict mode is enabled
- Source maps are generated for debugging