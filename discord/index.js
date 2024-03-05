const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Collection, Client, Events, GatewayIntentBits } = require('discord.js');
const { deployCommands } = require('./util/commands');

class Watcher {
    constructor() {
        dotenv.config();

        if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_GUILD_ID || !process.env.CONTAINER_NAME) {
            throw new Error('Missing required configuration variables, exiting!');
        }

        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    }

    async init() {
        console.log('Starting Discord handler...');
        
        await this.loadCommands();
        this.setEventListeners();
        
        console.log('Discord handler ready!');
    }
    
    async loadCommands() {
        await deployCommands();
        
        this.client.commands = new Collection();

        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    this.client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    setEventListeners() {
        this.client.on(Events.InteractionCreate, this.onInteraction);
        this.client.login(process.env.DISCORD_TOKEN);
    }

    async onInteraction(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}

(new Watcher()).init();