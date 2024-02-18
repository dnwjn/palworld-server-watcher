FROM alpine:latest

# Metadata
LABEL maintainer="hello@dnwjn.dev" \
      name="dnwjn/palworld-server-watcher" \
      github="https://github.com/dnwjn/palworld-server-watcher"

# Install dependencies
RUN apk add --no-cache tcpdump docker openrc socat \
    && rm -rf /var/cache/apk/*

# Set environment variables
ENV CONTAINER_NAME=palworld-server \
    GAME_PORT=8211 \
    QUERY_PORT=27015 \
    LOOP_SLEEP_SECONDS=30 \
    CONNECT_GRACE_SECONDS=60 \
    DEBUG=false

# Copy files
COPY ./entrypoint.sh /entrypoint.sh

# Set permissions
RUN ["chmod", "+x", "/entrypoint.sh"]

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]