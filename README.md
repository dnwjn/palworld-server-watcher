# Palworld Server Watcher

A watcher that will start/stop the Palworld server ([thijsvanloef/palworld-server-docker][server]).

What it does:

* It listens to the game port and starts the server if a player tries to connect
* It checks for players and gracefully stops the server if none are connected

> [!IMPORTANT]
> This only works if RCON is enabled.

## How to use

See the example [docker-compose.yml file][docker-compose] for an example configuration.

### Variables

| Name                    | Description                                                             | Default           |
|-------------------------|-------------------------------------------------------------------------|-------------------|
| `CONTAINER_NAME`        | The name of the server container.                                       | `palworld-server` |
| `GAME_PORT`             | The same value as `PORT` in the server container.                       | `8211`            |
| `RCON_PORT`             | The same value as `RCON_PORT` in the server container.                  | `25575`           |
| `LOOP_SLEEP_SECONDS`    | How often to check the server status.                                   | `30`              |
| `CONNECT_GRACE_SECONDS` | After starting the server, how long to wait before continuing the loop. | `60`              |

## License

The scripts and documentation in this project are released under the [MIT License][license].

[server]: https://github.com/thijsvanloef/palworld-server-docker
[docker-compose]: docker-compose.yml.example
[license]: LICENSE.md