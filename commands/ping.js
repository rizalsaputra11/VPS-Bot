const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1211544398219976724"];
        
        this.setName("ping");
        this.setDescription("Check if the bot is online");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;
        
        interaction.reply('**Pong** :coin: :D')
    }

}

module.exports = { default: CMD };