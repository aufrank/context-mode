const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}


async function install(extensionPath) {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showErrorMessage('Open a workspace folder before installing Context Mode hooks.');
    return;
  }
  const root = folders[0].uri.fsPath;
  const src = path.join(extensionPath, '..', '..', 'configs', 'vscode-copilot');

  // If extension packaged, files live inside extensionPath/configs
  const packagedSrc = path.join(extensionPath, 'configs', 'vscode-copilot');
  let sourceDir = packagedSrc;
  if (!fs.existsSync(sourceDir)) {
    sourceDir = src; // fallback to workspace copy
  }

  try {
    // We no longer write plugin hooks into the workspace automatically.
    // The plugin bundles a `hooks/` directory at its root — reveal that to the user
    // and offer to copy the `mcp.json` into `.vscode` if they explicitly request it.
    copyFile(path.join(sourceDir, 'copilot-instructions.md'), path.join(root, '.github', 'copilot-instructions.md'));

    const hooksFolder = path.join(extensionPath, '..', '..', 'hooks');
    const mcpSrc = path.join(sourceDir, 'mcp.json');

    const installChoice = await vscode.window.showInformationMessage(
      'Context Mode bundles hooks inside the plugin. Open packaged hooks folder or copy `mcp.json` into workspace?',
      'Open hooks folder',
      'Copy mcp.json to .vscode',
      'Cancel'
    );

    if (installChoice === 'Open hooks folder') {
      try {
        await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(hooksFolder));
      } catch (e) {
        // best-effort fallback
        vscode.window.showInformationMessage('Hooks are located in the extension package: ' + hooksFolder);
      }
    } else if (installChoice === 'Copy mcp.json to .vscode') {
      try {
        copyFile(mcpSrc, path.join(root, '.vscode', 'mcp.json'));
        vscode.window.showInformationMessage('Context Mode `mcp.json` copied to .vscode');
      } catch (err) {
        vscode.window.showErrorMessage('Failed to copy mcp.json: ' + err.message);
      }
    } else {
      vscode.window.showInformationMessage('Context Mode installation canceled. No hooks were written to workspace.');
    }
  } catch (err) {
    vscode.window.showErrorMessage('Failed to install Context Mode copilot hooks: ' + err.message);
  }
}

async function uninstall() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showErrorMessage('Open a workspace folder before uninstalling Context Mode hooks.');
    return;
  }
  const root = folders[0].uri.fsPath;
  const targets = [
    path.join(root, '.github', 'copilot-instructions.md'),
    path.join(root, '.github', 'hooks', 'context-mode.json'),
    path.join(root, '.vscode', 'mcp.json')
  ];
  try {
    for (const t of targets) {
      if (fs.existsSync(t)) fs.unlinkSync(t);
    }
    vscode.window.showInformationMessage('Context Mode copilot hooks removed from workspace.');
  } catch (err) {
    vscode.window.showErrorMessage('Failed to remove Context Mode files: ' + err.message);
  }
}

function activate(context) {
  const installCmd = vscode.commands.registerCommand('context-mode.installCopilotHooks', () => install(context.extensionPath));
  const uninstallCmd = vscode.commands.registerCommand('context-mode.uninstallCopilotHooks', () => uninstall());
  context.subscriptions.push(installCmd, uninstallCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
