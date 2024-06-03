const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("earn");
        this.setDescription("Do offers to get credits. (manual rewards)");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;

        interaction.reply(`https://wall.adgaterewards.com/na6Zq2o/${interaction.user.id}`)
    }

}

module.exports = { default: CMD };
