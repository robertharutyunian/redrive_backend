#!/bin/bash
jq -r '.tool_input.file_path' | { read -r f; case "$f" in *.ts) pnpm exec oxlint "$f" 2>/dev/null || true;; esac; }
