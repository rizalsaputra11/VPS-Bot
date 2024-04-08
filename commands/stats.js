const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("stats");
        this.setDescription("Get the node stats");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;
        
        var res = '**NODES:**\n';
        const db = require('../db');

        var totalSlots = 0;
        var totalAvailable = 0;
        var totalTaken = 0;

        var nodes = await db.Node.find();

        for(let i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            var status = '';
            if (node.isFull) {
                status = `:red_circle:`;
            } else {
                status = ':green_circle:';
            }
            if (node.isAvailable == false) {
                status =  `:orange_circle:`;
            } else {
                totalSlots += node.vpsLimit;
            }
            totalTaken += node.vpsCount;
            res += `\n${status} \`${node.code}\` **${node.vpsCount}/${node.vpsLimit}** - ${Math.round((node.vpsCount/node.vpsLimit)*100)}%`;
        }

        totalAvailable = totalSlots - totalTaken;

        res += `\n\n:green_circle: - Slots available\n:orange_circle: - Under maintenance\n:red_circle: - Full (no slots available)`;
        res += `\n\n**STATS:**\n`;
        res += `Total slots: ${totalSlots}\nTaken: ${totalTaken}\nAvailable: ${totalAvailable}`;

        interaction.reply(res);
    }

}

module.exports = { default: CMD };