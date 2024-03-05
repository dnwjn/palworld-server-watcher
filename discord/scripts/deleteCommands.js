const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const discordToken = process.env.DISCORD_TOKEN;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordGuildId = process.env.DISCORD_GUILD_ID;

if (!discordToken || !discordClientId || !discordGuildId) {
    throw new Error('Missing required configuration variables, exiting!')
}

const rest = new REST().setToken(discordToken);

(async () => {
    try {
        console.log(`Started deleting application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(discordClientId, discordGuildId),
            { body: [] }
        );

        console.log(`Successfully deleted application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();