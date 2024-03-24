# Palworld Server Watcher

A watcher for your Palworld server ([thijsvanloef/palworld-server-docker][server]).

What it does:

* It listens to the game port and starts the server if a player tries to connect (RCON required)
* It checks for players and gracefully stops the server if none are connected (RCON required)
* It allows you to start/stop the server through Discord

## How to use

See the example [docker-compose.yml file][docker-compose] for an example configuration.

### Variables

| Name                     | Description                                                                                                                        | Default           |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| `CONTAINER_NAME`         | The name of the server container.                                                                                                  | `palworld-server` |
| `GAME_PORT`              | The same value as `PORT` in the server container.                                                                                  | `8211`            |
| `QUERY_PORT`             | The same value as `QUERY_PORT` in the server container.                                                                            | `27015`           |
| `LOOP_SLEEP_SECONDS`     | How often to check the server status.                                                                                              | `30`              |
| `CONNECT_GRACE_SECONDS`  | After starting the server, how long to wait before continuing the loop.                                                            | `60`              |
| `SHUTDOWN_DELAY_SECONDS` | How long to wait before shutting down the server after the last player leaves. The shutdown will be cancelled when a player joins. | `0` (immediately) |
| `DISCORD_TOKEN`          | The token of your Discord bot.                                                                                                     |                   |
| `DISCORD_CLIENT_ID`      | The client ID of your Discord bot.                                                                                                 |                   |
| `DISCORD_GUILD_ID`       | The ID of your Discord server.                                                                                                     |                   |
| `DEBUG`                  | If debug mode should be enabled.                                                                                                   | `false`           |

### Setup notes

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

### Discord

#### Set up

You can enable the Discord integration in order to start/stop your server, or retrieve its status, straight from Discord.

To enable this, you will need to do the following:
1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications) and create a Discord application
2. Under `Bot`, enable `MESSAGE CONTENT INTENT`
3. Under `OAuth2` > `OAuth2 URL Generator`, check at least `bot`, `applications.commands` and `Send Messages`, and copy the generated URL
4. Paste the URL in a new tab and add the bot to your server
5. Set the following variables in the configuration of the watcher:
    1. `DISCORD_TOKEN` -> You can retrieve this by clicking `Reset Token` under `Bot`
    2. `DISCORD_CLIENT_ID` -> You can find this under `OAuth2` > `Client information`
    3. `DISCORD_GUILD_ID` -> You can retrieve this by right clicking on your Discord server and clicking `Copy Server ID` (make sure `Developer Mode` is active)

If everything is set up correctly, you should see the following message in the logs when you launch the watcher container again: `Discord handler ready!`

#### Clean up

> This is for advanced users, normally you should not need this.

If you want to delete all of the bot's commands from your server, simply execute the following while the container is running:

```
docker exec -it <container_name> delete_all_discord_commands
```

## License

The scripts and documentation in this project are released under the [MIT License][license].

[server]: https://github.com/thijsvanloef/palworld-server-docker
[docker-compose]: docker-compose.yml.example
[license]: LICENSE.md