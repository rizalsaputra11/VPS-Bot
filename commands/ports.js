const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("ports");
        this.setDescription("Get your forwarded ports");

        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        const db = require('../db');

        var user = await lib.getUser(interaction);

        var id = interaction.options.getInteger('id');

        var VPS = await db.VPS.findOne({
            shortID: id,
            userID: interaction.user.id
        });
        if (!VPS) return await lib.error(interaction, 'VPS not found');

        var portCount = await db.Port.find({
            vpsID: VPS._id
        });

        console.log(portCount);
       
        var r;
        r = '';
        for (let i = 0; i < portCount.length; i++) {
            r += `\n${VPS.nodeIP}:${portCount[i].port} -> :${portCount[i].intPort}`;
        }

        interaction.reply(`**YOUR PORTS**\n${r}`);
    }

}

module.exports = { default: CMD };