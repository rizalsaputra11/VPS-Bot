const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("list");
        this.setDescription("List your vps");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);
        
        const db = require('../db');
        var VPS = await db.VPS.find({
            userID: interaction.user.id
        });

        var res = `**YOUR VPS (${VPS.length}/${user.vpsLimit})**:\n\n`;
        
        if (VPS.length == 0) res += `> \tYou currently don't have any VPS. If you need one, create one with /create.`;

        for (let i = 0; i < VPS.length; i++) {
            var vps = VPS[i];

            res += `**VPS ${vps.name}** (\`${vps.node}-${vps.proxID}\`):\n`;
            res += `ID: ${vps.node}-${vps.proxID}\n`;
            res += `Expiry: ${time( new Date(vps.expiry), 'R')}\n`;
            res += `State: ${vps.state}\n`;

            res += '\n\n';
        }

        interaction.reply(res)
    }

}

module.exports = { default: CMD };