#!/bin/sh

NC="\033[0m"
WARNING="\033[0;33m"

echo_warning() {
    echo -e "${WARNING}$1${NC}"
}

if [[ -z "$DISCORD_TOKEN" || -z "$DISCORD_CLIENT_ID" || -z "$DISCORD_GUILD_ID" ]]; then
    echo_warning "Cannot delete all Discord commands because of missing configuration."
else
    node ./discord/scripts/deleteCommands.js
fi