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

        if (!VPS.type) VPS.type = 'normal';

        if (VPS.type == 'normal') {
            VPS.expiry = dayjs().add(7, 'day');
        }
        if (VPS.type == 'test') {
            VPS.expiry = dayjs().add(3, 'hour');
        }

        await VPS.save();

        const { time } = require('discord.js');

        const ex = time(  new Date(VPS.expiry) , 'R');

        interaction.editReply(`VPS Renewed! Expiry: ${ex}`);
    }

}

module.exports = { default: CMD };
