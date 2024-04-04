const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("forward");
        this.setDescription("Forward a port");

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

        var portCount = await db.Port.find({
            vpsID: VPS._id
        });
        portCount = portCount.length;

        if (portCount >= user.portLimit) return await lib.error(interaction, `You have reached the port limit of ${user.portLimit} and you currently have ${portCount} ports.`);

        var sshPort = await db.Port.findOne({
            node: VPS.node,
            isUsed: false
        });
        if (!sshPort) return await lib.error(interaction, 'Sorry, no ports are available. Please contact an administrator.');
        sshPort.isUsed = true;
        sshPort.intPort = port;
        sshPort.vpsID = VPS._id;
        await sshPort.save();

        await interaction.deferReply();

        var queue = interaction.client.opsQueue[VPS.node];

        if (!queue) return await lib.error(interaction, 'Node not found?', true);

        await interaction.editReply('Adding to queue...');
        
        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
            action: 'forward',
            proxID: VPS.proxID,
            ip: VPS.ip,
            port: sshPort.port,
            intPort: port,
            userID: interaction.user.id,
            portID: sshPort._id
        });

        await job.waitUntilFinished(queue.events);

        interaction.editReply(`**QUEUED**\nYour port forward request of port ${port} has been placed in the queue (${job.id}) and will be processed shortly. External port: ${sshPort.port}`);
    }

}

module.exports = { default: CMD };