const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("delete");
        this.setDescription("Delete your vps");

        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);

        var id = interaction.options.getInteger('id');
        
        const db = require('../db');
        var VPS = await db.VPS.findOne({
            userID: interaction.user.id,
            shortID: id
        });

        if (!VPS) return await lib.error(interaction, 'VPS not found');

        await interaction.deferReply();

        var queue = interaction.client.opsQueue[VPS.node];

        if (!queue) return await lib.error(interaction, 'Node not found?', true);

        interaction.editReply('Adding to queue... You might get a lot of DMs.');

        var vpsPorts = await db.Port.find({
            vpsID: VPS._id
        });

        var jobs;
        jobs = [];

        for(let i = 0; i < vpsPorts.length; i++) {
            var port = vpsPorts[i];

            var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
                action: 'remforward',
                proxID: VPS.proxID,
                ip: VPS.ip,
                port: port.port,
                intPort: port.intPort,
                userID: interaction.user.id,
                portID: port._id
            });

            port.isUsed = false;
            port.vpsID = null;
            port.intPort = null;
            await port.save();

            jobs.push(String(job.id))

        }

        interaction.editReply(`Added port forwards to queue. Deleting vps... Job IDs: ${jobs.join(', ')}`)

        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
            action: 'delete',
            proxID: VPS.proxID,
            userID: interaction.user.id,
        });

        await db.VPS.deleteOne({
            _id: VPS._id
        });

        interaction.editReply(`VPS delete added to queue: ${job.id}. Port ID: ${jobs.join(', ')}`)
    }

}

module.exports = { default: CMD };