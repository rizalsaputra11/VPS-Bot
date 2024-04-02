const { SlashCommand } = require('slashctrl');
const { time } = require('discord.js');
const lib = require('../lib');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        // this.guilds = ["1211544398219976724"];
        
        this.setName("forward");
        this.setDescription("Forward a port");

        this.addStringOption(option =>
            option.setName('id')
                .setDescription('VPS ID')
				.setRequired(true));

        this.addIntegerOption(option =>
            option.setName('port')
                .setDescription('internal port (e.g. 80)')
                .setRequired(true));

        this.requiresAdmin = false;
    }
    
    async execute(interaction) {
        if (await lib.checkAdmin(this, interaction)) return;

        const db = require('../db');

        var user = await lib.getUser(interaction);

        var id = interaction.options.getString('id');
        var port = interaction.options.getInteger('port');

        var VPS = await db.VPS.findOne({
            _id: id
        });
        if (!VPS) return await lib.error(interaction, 'VPS not found');

        var portCount = await db.Port.find({
            vpsID: VPS._id
        });
        portCount = portCount.length;

        console.log(portCount);

        if (portCount >= user.portLimit) return await lib.error(interaction, `You have reached the port limit of ${user.portLimit} and you currently have ${portCount} ports.`);

        var sshPort = await db.Port.findOne({
            node: VPS.node,
            isUsed: false
        });
        sshPort.isUsed = true;
        sshPort.vpsID = VPS._id;
        
        interaction.reply(`${id} and ${port}`)
    }

}

module.exports = { default: CMD };