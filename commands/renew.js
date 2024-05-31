const { SlashCommand } = require('slashctrl');
const lib = require('../lib');


var randomip = require('random-ip');
var generator = require('generate-password');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("renew");
        this.setDescription("Renew vps");

        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS your ID')
				.setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);

        if (user.balance < 50) {
            return  await lib.error(interaction, 'You need at least `0.50` credits in order to create a vps. You can get credits by sending messages. Each message is worth 0.01 credits.');
        }

        var ID = interaction.options.getInteger('id');

        const db = require('../db');

        var VPS = await db.VPS.findOne({
            shortID: ID,
            userID: interaction.user.id
        });

        if (!VPS) return await lib.error(interaction, 'VPS not found');

        console.log('vps', VPS);

        if (VPS.state != 'created') return await lib.error(interaction, 'VPS is not created, but is ' + VPS.state);
        
        await interaction.deferReply();

        const dayjs = require('dayjs');

        if (!VPS.type) VPS.type = 'alpine';
        VPS.expiry = dayjs().add(3, 'day');

        await VPS.save();

        const { time } = require('discord.js');

        const ex = time(  new Date(VPS.expiry) , 'R');

        user.balance = user.balance - 50;
        await user.save();

        interaction.editReply(`VPS Renewed! Expiry: ${ex}`);
    }

}

module.exports = { default: CMD };
