#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

function findPortFile() {
	let currentDir = process.cwd();
	
	while (currentDir !== path.dirname(currentDir)) {
		const vscodeDir = path.join(currentDir, '.vscode');
		const portFile = path.join(vscodeDir, 'vscode-notify-desktop-port.json');
		
		if (fs.existsSync(portFile)) {
			try {
				const data = JSON.parse(fs.readFileSync(portFile, 'utf8'));
				// Check if the process is still running
				try {
					process.kill(data.pid, 0);
					return data;
				} catch {
					// Process not running, ignore this file
				}
			} catch (error) {
				// Invalid JSON, ignore
			}
		}
		
		currentDir = path.dirname(currentDir);
	}
	
	return null;
}

function sendNotification(port, message, type = 'info') {
	const workspacePath = process.cwd();
	const data = JSON.stringify({ 
		message, 
		type, 
		workspacePath 
	});
	
	const options = {
		hostname: 'localhost',
		port: port,
		path: '/notify',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(data)
		}
	};
	
	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let responseData = '';
			
			res.on('data', (chunk) => {
				responseData += chunk;
			});
			
			res.on('end', () => {
				if (res.statusCode === 200) {
					resolve(JSON.parse(responseData));
				} else {
					reject(new Error(`Server responded with ${res.statusCode}: ${responseData}`));
				}
			});
		});
		
		req.on('error', (error) => {
			reject(error);
		});
		
		req.write(data);
		req.end();
	});
}

function parseArgs() {
	const args = process.argv.slice(2);
	const result = {
		message: '',
		type: 'info',
		port: null,
		all: false
	};
	
	let i = 0;
	while (i < args.length) {
		if (args[i] === '--type' || args[i] === '-t') {
			result.type = args[++i];
		} else if (args[i] === '--port' || args[i] === '-p') {
			result.port = parseInt(args[++i]);
		} else if (args[i] === '--all' || args[i] === '-a') {
			result.all = true;
		} else if (args[i] === '--help' || args[i] === '-h') {
			showHelp();
			process.exit(0);
		} else {
			result.message = args.slice(i).join(' ');
			break;
		}
		i++;
	}
	
	return result;
}

function showHelp() {
	console.log(`
vscode-notify-desktop - Send desktop notifications to VS Code

Usage:
  vscode-notify-desktop [options] <message>

Options:
  -t, --type <type>    Notification type: info, warning, error (default: info)
  -p, --port <port>    Specific port to connect to
  -a, --all            Send to all running VS Code instances
  -h, --help           Show this help message

Examples:
  vscode-notify-desktop "Build completed successfully"
  vscode-notify-desktop --type error "Tests failed!"
  vscode-notify-desktop -t warning "Low disk space"
  vscode-notify-desktop --port 7532 "Custom port notification"
`);
}

async function main() {
	const args = parseArgs();
	
	if (!args.message) {
		console.error('Error: No message provided');
		showHelp();
		process.exit(1);
	}
	
	// Validate notification type
	if (!['info', 'warning', 'error'].includes(args.type)) {
		console.error(`Error: Invalid type "${args.type}". Must be info, warning, or error.`);
		process.exit(1);
	}
	
	let ports = [];
	
	if (args.port) {
		// Use specified port
		ports.push(args.port);
	} else if (args.all) {
		// Try all common ports
		for (let i = 0; i < 10; i++) {
			ports.push(7531 + i);
		}
	} else {
		// Try to find port from workspace
		const portInfo = findPortFile();
		if (portInfo) {
			ports.push(portInfo.port);
		} else {
			// Fallback to default port
			ports.push(7531);
		}
	}
	
	let success = false;
	let lastError = null;
	
	for (const port of ports) {
		try {
			await sendNotification(port, args.message, args.type);
			if (!args.all) {
				console.log(`✓ Notification sent to VS Code on port ${port}`);
				success = true;
				break;
			} else {
				console.log(`✓ Notification sent to VS Code on port ${port}`);
				success = true;
			}
		} catch (error) {
			lastError = error;
			if (!args.all) {
				// Only log error if not trying all ports
				if (error.code === 'ECONNREFUSED') {
					console.error(`✗ Could not connect to VS Code on port ${port}. Is the extension active?`);
				} else {
					console.error(`✗ Error: ${error.message}`);
				}
			}
		}
	}
	
	if (!success && !args.all) {
		console.error('\nMake sure the vscode-notify extension is installed and VS Code is running.');
		process.exit(1);
	} else if (args.all && !success) {
		console.error('✗ Could not send notification to any VS Code instance');
		process.exit(1);
	}
}

main().catch(error => {
	console.error('Unexpected error:', error);
	process.exit(1);
});