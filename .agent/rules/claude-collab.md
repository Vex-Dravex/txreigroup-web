# Agent Rule: Claude Code Collaboration Protocol

## Context
The user has an active Claude Code CLI subscription running in the integrated terminal. This tool is preferred for complex logic, deep refactoring, and Swift/Backend architecture.

## Delegation Logic
Antigravity Agents should delegate to Claude Code via the terminal when:
1. The task involves complex algorithmic logic.
2. The task requires broad refactoring across 3+ files.
3. The Antigravity agent hits a "logic loop" or fails a test twice.

## Instructions for Antigravity Agents
- **Do Not Overwrite:** If Claude Code is actively running in the terminal, wait for it to finish before modifying the same files.
- **Task Handoff:** When delegating, print a message in the chat: "Delegating logic implementation to Claude Code. Please run: `claude 'implementation instructions'`"
- **Verification Role:** After Claude completes a task, the Antigravity Browser Agent MUST automatically refresh the preview and verify the UI hasn't regressed.
- **Syncing:** Read any `.claude/summary` files created by Claude to update the Mission Control task status.

## Workflow Integration
- **AG Agent:** Handles Browser testing, Asset generation (Nano Banana), and Task tracking.
- **Claude CLI:** Handles heavy-duty coding and API integrations.
