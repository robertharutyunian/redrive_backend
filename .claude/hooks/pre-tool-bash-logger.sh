#!/bin/bash
jq -r '.tool_input.command' | { read -r cmd; echo "$(date '+%H:%M:%S') $cmd" >> /tmp/redrive-bash-log.txt; }
