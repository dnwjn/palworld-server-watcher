const { SlashCommandBuilder } = require('discord.js');
const { askConfirmation } = require('../../util/discord');
const { dockerInspect, dockerStop } = require('../../util/docker.js');

const onRunning = async (interaction) => {
    askConfirmation(interaction, 'Confirm stop', 'Are you sure you want to stop the server?')
        .then(async (confirmation) => {
            if (confirmation.customId === 'confirm') {
                await confirmation.update({ content: 'I am stopping the server!', components: [] });
                await dockerStop();
            } else {
                await confirmation.update({ content: 'Action cancelled.', components: [] });
            }
        })
        .catch(async () => {
            await interaction.editReply({ content: 'Server not stopped.', components: [] });
        });
};

module.exports = {
    data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the server if it is active.'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const status = await dockerInspect();

            switch (status) {
                case 'running':
                    await onRunning(interaction);
                    break;
                case 'created':
                case 'exited':
                case 'stopped':
                case 'paused':
                    await interaction.editReply('The server is already stopped, so there is nothing left for me to do.');
                    break;
                case 'restarting':
                    await interaction.editReply('The server is restarting, so I will let it do its thing.');
                    break;
                default:
                    await interaction.editReply('The server is not in a state I can take care of. A human should go take a look.');
                    break;
            }
        } catch (err) {
            console.log('Stop error: ' + err);
            await interaction.editReply('Could not stop the server, please check the logs.');
        }
    },
};