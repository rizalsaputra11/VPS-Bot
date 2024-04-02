const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("removeforward");
        this.setDescription("Remove a port forward");

        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

        this.addIntegerOption(option =>
            option.setName('port')
                .setDescription('internal port (e.g. 80)')
                .setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        const db = require('../db');

        var user = await lib.getUser(interaction);

        var id = interaction.options.getInteger('id');
        var port = interaction.options.getInteger('port');

        var VPS = await db.VPS.findOne({
            shortID: id,
            userID: interaction.user.id
        });
        if (!VPS) return await lib.error(interaction, 'VPS not found');

        var Port = await db.Port.findOne({
            vpsID: VPS._id,
            intPort: port
        });

        if (!Port) return await lib.error(interaction, 'Port not found');

        Port.isUsed = false;
        Port.intPort = null;
        Port.vpsID = null;
        await Port.save();

        await interaction.deferReply();

        var queue = interaction.client.opsQueue[VPS.node];

        if (!queue) return await lib.error(interaction, 'Node not found?', true);

        await interaction.editReply('Adding to queue...');
        
        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
            action: 'remforward',
            proxID: VPS.proxID,
            ip: VPS.ip,
            port: Port.port,
            intPort: port,
            userID: interaction.user.id,
            portID: Port._id
        });

        interaction.editReply(`**QUEUED**\nYour request to remove the forwarded port has been placed in the queue with iD ${job.id} and will get processed shortly. External port: ${Port.port}`);
    }

}

module.exports = { default: CMD };