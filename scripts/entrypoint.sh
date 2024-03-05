#!/bin/sh

NC="\033[0m"
INFO="\033[0;34m"
SUCCESS="\033[0;32m"
WARNING="\033[0;33m"

running=false
skip_sleep=false

echo_line() {
    echo -e "$1"
}

echo_info() {
    echo -e "${INFO}$1${NC}"
}

echo_success() {
    echo -e "${SUCCESS}$1${NC}"
}

echo_warning() {
    echo -e "${WARNING}$1${NC}"
}

is_debug() {
    if [ "$DEBUG" = true ]; then
        return 0
    else
        return 1
    fi
}

echo_debug() {
    if is_debug; then
        echo_line "[DEBUG] $1"
    fi
}

is_running() {
    if [ "$( docker container inspect -f '{{.State.Status}}' ${CONTAINER_NAME} )" = "running" ]; then
        return 0
    else
        return 1
    fi
}

start_discord_handler() {
    if [[ -z "$DISCORD_TOKEN" || -z "$DISCORD_CLIENT_ID" || -z "$DISCORD_GUILD_ID" ]]; then
        echo_warning "Skipping Discord handler because of missing configuration."
    else
        node ./discord/index.js &
    fi
}

start_tunnel() {
    echo_line "Started tunnel on game port ${GAME_PORT} to ${CONTAINER_NAME}."
    socat TCP4-LISTEN:$GAME_PORT,fork,reuseaddr TCP4:$CONTAINER_NAME:$GAME_PORT &

    if [ -n "$QUERY_PORT" ]; then
        echo_line "Started tunnel on query port ${QUERY_PORT} to ${CONTAINER_NAME}."
        socat TCP4-LISTEN:$QUERY_PORT,fork,reuseaddr TCP4:$CONTAINER_NAME:$QUERY_PORT &
    fi
}

check_for_start() {
    echo_debug "Listening for connection attempts on port ${GAME_PORT}..."

    # Command to trigger locally: nc -vu localhost 8211
    tcpdump -n -c 1 -i any port $GAME_PORT 2> /dev/null

    echo_debug "Connection attempt detected on game port $GAME_PORT."
    
    echo_info "***STARTING SERVER***"
    docker start "${CONTAINER_NAME}" > /dev/null
    
    max_attempts=10
    attempt=0
    until [ $attempt -ge $max_attempts ] || docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null | grep -q "healthy"; do
        echo_line "Waiting for the server to be healthy..."
        sleep 5
        attempt=$(( attempt + 1 ))
    done

    if [ $attempt -ge $max_attempts ]; then
        echo_warning "Server did not become healthy after ${max_attempts} attempts. Please check the server logs."
    else
        echo_success "Server is healthy."

        echo_line "Allowing users ${CONNECT_GRACE_SECONDS} seconds to connect..."
        sleep "${CONNECT_GRACE_SECONDS}"

        running=true
        skip_sleep=true
    fi
}

check_for_stop() {
    echo_debug "Checking for players..."

    if is_running; then
        players_output=$(docker exec -i "${CONTAINER_NAME}" rcon-cli ShowPlayers)

        if [ "$players_output" = "name,playeruid,steamid" ]; then
            echo_line "No players found. Server will be shut down."
            echo_info "***STOPPING SERVER***"

            docker stop "${CONTAINER_NAME}" > /dev/null

            running=false
            skip_sleep=true
        fi
    else
        echo_line "Server has already been shut down."
        running=false
        skip_sleep=true
    fi
}

run() {
    echo_success "***STARTING MONITOR***"
    echo_debug "Debug mode is enabled."

    start_discord_handler
    start_tunnel

    echo_debug "Waiting 5 seconds..."
    sleep 5

    if is_running; then
        echo_line "Server is already running."
        echo_line "Allowing users ${CONNECT_GRACE_SECONDS} seconds to connect..."
        sleep "${CONNECT_GRACE_SECONDS}"
        running=true
    else
        echo_line "Server is not running."
        running=false
    fi

    while true; do
        if [ "$running" = false ]; then
            check_for_start
        else
            check_for_stop
        fi

        if [ "$skip_sleep" = true ]; then
            skip_sleep=false
        else
            echo_debug "Sleeping for ${LOOP_SLEEP_SECONDS} seconds..."
            sleep "${LOOP_SLEEP_SECONDS}"
        fi
    done
}

run