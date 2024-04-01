const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("list");
        this.setDescription("List your vps");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;

        interaction.reply('**YOUR VPS**')
    }

}

module.exports = { default: CMD };