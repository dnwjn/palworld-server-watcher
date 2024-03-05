const { SlashCommandBuilder } = require('discord.js');
const { dockerInspect } = require('../../util/docker.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Retrieves the current status of the server.'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const status = await dockerInspect();

            switch (status) {
                case 'created':
                case 'exited':
                case 'stopped':
                    await interaction.editReply('The server is not running.');
                    break;
                case 'paused':
                    await interaction.editReply('The server is paused.');
                    break;
                case 'restarting':
                    await interaction.editReply('The server is restarting.');
                    break;
                case 'running':
                    await interaction.editReply('The server is running.');
                    break;
                default:
                    await interaction.editReply('The server is in an unknown state.');
                    break;
            }
        } catch (err) {
            console.log('Status error: ' + err);
            await interaction.editReply('Could not retrieve the status of the server, please check the logs.');
        }
    },
};