const { SlashCommand } = require('slashctrl');
const { checkAdmin } = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("support");
        this.setDescription("Need help/support? Ask on our forum!");

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await checkAdmin(this, interaction)) return;

        interaction.reply('**Need help?**\nAsk on our forum! <https://lnbz.la/1efThCF>')
    }

}

module.exports = { default: CMD };
