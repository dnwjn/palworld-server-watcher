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
| `QUERY_PORT`            | The same value as `QUERY_PORT` in the server container.                 | `27015`           |
| `LOOP_SLEEP_SECONDS`    | How often to check the server status.                                   | `30`              |
| `CONNECT_GRACE_SECONDS` | After starting the server, how long to wait before continuing the loop. | `60`              |
| `DEBUG`                 | If debug mode should be enabled.                                        | `false`           |

### Notes

#### `network_mode`

You need to set the `network_mode` attribute in the configuration of the server:

```
network_mode: service:<watcher-service-name>
```

So if you follow the example it would be:

```
network_mode: service:watcher
```

#### `ports`

You need to move the `ports` configuration to the watcher, as traffic will route via the watcher to the server.

## License

The scripts and documentation in this project are released under the [MIT License][license].

[server]: https://github.com/thijsvanloef/palworld-server-docker
[docker-compose]: docker-compose.yml.example
[license]: LICENSE.md