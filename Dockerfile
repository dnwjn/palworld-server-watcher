# Set up Node
FROM node:18.14.2-alpine AS node

# Set up base
FROM alpine:latest

# Metadata
LABEL maintainer="hello@dnwjn.dev" \
      name="dnwjn/palworld-server-watcher" \
      github="https://github.com/dnwjn/palworld-server-watcher"

# Copy node files
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

# Install dependencies
RUN apk add --no-cache --update tcpdump docker openrc socat \
    && rm -rf /var/cache/apk/*

# Set environment variables
ENV CONTAINER_NAME=palworld-server \
    GAME_PORT=8211 \
    QUERY_PORT=27015 \
    LOOP_SLEEP_SECONDS=30 \
    CONNECT_GRACE_SECONDS=60 \
    DEBUG=false \
    DISCORD_TOKEN="" \
    DISCORD_CLIENT_ID="" \
    DISCORD_GUILD_ID=""

# Set workdir
WORKDIR /app

# Copy Node files
COPY ./package-lock.json package-lock.json
COPY ./package.json package.json

# Install Node dependencies
RUN ["npm", "ci"]

# Copy up Discord files
COPY ./discord ./discord

# Set up script to delete Discord commands
COPY ./scripts/delete_all_discord_commands.sh /usr/local/bin/delete_all_discord_commands
RUN ["chmod", "+x", "/usr/local/bin/delete_all_discord_commands"]

# Set up entrypoint
COPY ./scripts/entrypoint.sh entrypoint.sh
RUN ["chmod", "+x", "./entrypoint.sh"]

# Entrypoint
ENTRYPOINT ["./entrypoint.sh"]