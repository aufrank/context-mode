# Context Mode — VS Code Copilot Agent Plugin

This lightweight VS Code extension installs the `context-mode` Copilot hook/config files into a workspace so VS Code Copilot will call the repo's MCP hooks and use the packaged `copilot-instructions.md` routing rules.

Quick usage

- Open your project workspace in VS Code.
- Install the extension VSIX (or run from source).
- Run the command palette and execute `Context Mode: Install Copilot Hooks` to copy the following into your workspace:
  - `.github/copilot-instructions.md`
  - `.github/hooks/context-mode.json`
  - Hook scripts under `.github/hooks/context-mode/` (pretooluse.mjs, posttooluse.mjs, precompact.mjs, sessionstart.mjs)
  - `.vscode/mcp.json`

Tasks

- `task package` — Produces a .vsix via `npx vsce package`.
- `task lint:vscode` — Runs ESLint over the extension files (requires ESLint installed/configured).
- `task install-vsix` — Installs any produced `.vsix` file into VS Code.

Notes

- The extension simply copies the packaged `configs/vscode-copilot` files into the workspace; it does not modify those files beyond copying.
- Ensure `npx vsce package` and `eslint` are available in your environment for packaging and linting tasks.
