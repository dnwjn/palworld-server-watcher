const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const askConfirmation = async (interaction, confirmLabel = 'Confirm', confirmText = 'Are you sure?') => {
	return new Promise(async (resolve, reject) => {
		const confirm = new ButtonBuilder()
	        .setCustomId('confirm')
	        .setLabel(confirmLabel)
	        .setStyle(ButtonStyle.Success);

	    const cancel = new ButtonBuilder()
	        .setCustomId('cancel')
	        .setLabel('Cancel')
	        .setStyle(ButtonStyle.Secondary);

	    const row = new ActionRowBuilder()
	        .addComponents(cancel, confirm);

	    const response = await interaction.editReply({
	        content: confirmText,
	        components: [row],
	        ephemeral: true
	    });

	    const collectorFilter = i => i.user.id === interaction.user.id;

	    try {
	        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	        resolve(confirmation);
	    } catch (e) {
	        reject(e);
	    }
	});
};

module.exports = {
	askConfirmation
};