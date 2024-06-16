const { SlashCommand } = require('slashctrl');
const lib = require('../lib');


var randomip = require('random-ip');
var generator = require('generate-password');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("ban");
        this.setDescription("[ADMIN] Delete vps & ban user");

        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

      this.addStringOption(option =>
            option.setName('reason')
                .setDescription('Ban reason')
				.setRequired(true));
      
        this.requiresAdmin = true;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);

        var ID = interaction.options.getInteger('id');

        const db = require('../db');

        var VPS = await db.VPS.findOne({
            shortID: ID
        });

        if (!VPS) return await lib.error(interaction, 'VPS not found');

        console.log('vps', VPS);

        if (VPS.state != 'created') return await lib.error(interaction, 'VPS is not created ' + VPS.state);
        
        await interaction.deferReply();

        VPS.expiry = 0;
        await VPS.save();

        var user = await db.User.findOne({
            userID: VPS.userID
        });

        var res = interaction.options.getString('reason');
        user.vpsLimit = 0;
        user.isBanned = true;
        user.banReason = res;
        await user.save();
      
        interaction.editReply(`Updated expiry & banned user`);
    }

}

module.exports = { default: CMD };
