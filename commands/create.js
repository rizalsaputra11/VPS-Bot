const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("create");
        this.setDescription("Create a vps");

        this.addStringOption(option =>
            option.setName('name')
                .setDescription('VPS name')
				.setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;

        // console.log(interaction.client);
        var queue = interaction.client.queue;

        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {});

        console.log(job);

        interaction.reply('VPS placed in queue. ID: ' + job.id)
    }

}

module.exports = { default: CMD };