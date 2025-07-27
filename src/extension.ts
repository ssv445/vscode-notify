import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

let server: http.Server | undefined;

interface NotificationRequest {
	message: string;
	type?: 'info' | 'warning' | 'error';
	duration?: number;
}

interface PortInfo {
	port: number;
	workspace: string;
	pid: number;
	timestamp: string;
}

async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
	for (let i = 0; i < maxAttempts; i++) {
		const port = startPort + i;
		try {
			await new Promise<void>((resolve, reject) => {
				const testServer = http.createServer();
				testServer.listen(port, 'localhost', () => {
					testServer.close(() => resolve());
				});
				testServer.on('error', reject);
			});
			return port;
		} catch (error) {
			continue;
		}
	}
	throw new Error('No available port found');
}

async function writePortInfo(port: number) {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		return;
	}

	const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
	const portFile = path.join(vscodeDir, 'vscode-notify-port.json');

	if (!fs.existsSync(vscodeDir)) {
		fs.mkdirSync(vscodeDir, { recursive: true });
	}

	const portInfo: PortInfo = {
		port,
		workspace: workspaceFolder.uri.fsPath,
		pid: process.pid,
		timestamp: new Date().toISOString()
	};

	fs.writeFileSync(portFile, JSON.stringify(portInfo, null, 2));
}

async function removePortInfo() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		return;
	}

	const portFile = path.join(workspaceFolder.uri.fsPath, '.vscode', 'vscode-notify-port.json');
	try {
		if (fs.existsSync(portFile)) {
			fs.unlinkSync(portFile);
		}
	} catch (error) {
		console.error('Error removing port file:', error);
	}
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('vscode-notify extension is now active!');

	const BASE_PORT = 7531;
	
	try {
		const port = await findAvailablePort(BASE_PORT);
		
		server = http.createServer((req, res) => {
			if (req.method === 'POST' && req.url === '/notify') {
				let body = '';
				
				req.on('data', chunk => {
					body += chunk.toString();
				});
				
				req.on('end', () => {
					try {
						const notification: NotificationRequest = JSON.parse(body);
						
						switch (notification.type) {
							case 'error':
								vscode.window.showErrorMessage(notification.message);
								break;
							case 'warning':
								vscode.window.showWarningMessage(notification.message);
								break;
							case 'info':
							default:
								vscode.window.showInformationMessage(notification.message);
								break;
						}
						
						res.writeHead(200, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify({ success: true }));
					} catch (error) {
						console.error('Error processing notification:', error);
						res.writeHead(400, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify({ error: 'Invalid request' }));
					}
				});
			} else {
				res.writeHead(404, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Not found' }));
			}
		});
		
		server.listen(port, 'localhost', async () => {
			console.log(`vscode-notify server listening on http://localhost:${port}`);
			await writePortInfo(port);
		});
		
		server.on('error', (error: any) => {
			console.error('Server error:', error);
			vscode.window.showErrorMessage(`vscode-notify: Server error - ${error.message}`);
		});

		context.subscriptions.push({
			dispose: async () => {
				if (server) {
					server.close();
					server = undefined;
				}
				await removePortInfo();
			}
		});
	} catch (error: any) {
		vscode.window.showErrorMessage(`vscode-notify: Failed to start server - ${error.message}`);
	}
}

export async function deactivate() {
	if (server) {
		server.close();
		server = undefined;
	}
	await removePortInfo();
}
