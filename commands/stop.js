const { SlashCommand } = require('slashctrl');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("stop");
        this.setDescription("Stop your vps");

        this.addStringOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);

        var ID = interaction.options.getString('id');

        const db = require('../db');

        var VPS = await db.VPS.findOne({
            _id: ID,
            userID: interaction.user.id
        });

        if (!VPS) return await lib.error(interaction, 'VPS not found');

        console.log('vps', VPS);

        if (VPS.state != 'created') return await lib.error(interaction, 'VPS is not created ' + VPS.state);
        
        await interaction.deferReply();

        // console.log(interaction.client);
        var queue = interaction.client.opsQueue[VPS.node];

        if (!queue) return await lib.error(interaction, 'Node not found?', true);

        await interaction.editReply('Adding to queue...');

        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
            action: 'stop',
            proxID: VPS.proxID,
            userID: interaction.user.id
        });

        interaction.editReply(`**QUEUED**\nThe action has been added to the queue as ID ${job.id} and will process shortly.`);
        console.log('after 5');
    }

}

module.exports = { default: CMD };