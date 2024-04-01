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

        interaction.reply('**Pong** :coin: :D')
    }

}

module.exports = { default: CMD };