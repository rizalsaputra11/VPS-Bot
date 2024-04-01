const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds= [""];
        
        this.setName("ping");
        this.setDescription("Check if the bot is online");
    }
    
    execute(interaction) {
        interaction.reply('**Pong** :coin: :D')
    }

}

module.exports = { default: CMD };