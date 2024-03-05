const { SlashCommandBuilder } = require('discord.js');
const { askConfirmation } = require('../../util/discord');
const { dockerInspect, dockerStart, dockerUnpause, dockerHealthy } = require('../../util/docker');
const { sleep } = require('../../util/time');

const onStopped = async (interaction) => {
    await interaction.editReply('I am starting the server!');
    await dockerStart();

    const maxAttempts = 10;
    let attempts = 0;
    let healthy = false;

    while (attempts < maxAttempts && !healthy) {
        healthy = dockerHealthy();
        await sleep(5000);
        attempts++;
    }

    if (healthy) {
        await interaction.editReply('Server is up and running. Go say hi to your pals!');
    } else {
        await interaction.editReply('Server did not get healthy, please check the logs.');
    }
};

const onPause = async (interaction) => {
    askConfirmation(interaction, 'Confirm unpause', 'Are you sure you want to unpause the server?')
        .then(async (confirmation) => {
            if (confirmation.customId === 'confirm') {
                await confirmation.update({ content: 'I am unpausing the server!', components: [] });
                await dockerUnpause();
            } else {
                await confirmation.update({ content: 'Action cancelled.', components: [] });
            }
        })
        .catch(async () => {
            await interaction.editReply({ content: 'Server not unpaused.', components: [] });
        });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Starts the server if it is inactive.'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const status = await dockerInspect();

            switch (status) {
                case 'created':
                case 'exited':
                case 'stopped':
                    await onStopped(interaction);
                    break;
                case 'paused':
                    await onPause(interaction);
                    break;
                case 'restarting':
                    await interaction.editReply('The server is restarting, so I will let it do its thing.');
                    break;
                case 'running':
                    await interaction.editReply('The server is already running, so there is nothing left for me to do.');
                    break;
                default:
                    await interaction.editReply('The server is not in a state I can take care of. A human should go take a look.');
                    break;
            }
        } catch (err) {
            console.log('Start error: ' + err);
            await interaction.editReply('Could not start the server, please check the logs.');
        }
    },
};
