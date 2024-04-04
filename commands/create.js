const { SlashCommand } = require('slashctrl');
const lib = require('../lib');


var randomip = require('random-ip');
var generator = require('generate-password');

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
        if (await lib.checkAdmin(this, interaction)) return;

        var user = await lib.getUser(interaction);
        
        var name = interaction.options.getString('name');

        const db = require('../db');
        var VPS = await db.VPS.find({
            userID: interaction.user.id
        });
        if (VPS.length >= user.vpsLimit) {
            return lib.error(interaction, `You have reached your vps limit. You are limited to ${user.vpsLimit} vps, but you currently have ${VPS.length} vps.`);
        }

        var node = await db.Node.findOne({
            isFull: false,
            isAvailable: true
        }).sort({ percent: 1 }).exec();

        if (!node) return await lib.error(interaction, 'No node available.');

        // console.log(node);

        await interaction.deferReply();

        // console.log(interaction.client);
        var queue = interaction.client.createQueue[node.code];

        if (!queue) return await lib.error(interaction, 'Node not found?', true);

        var password = generator.generate({
            length: 15,
            uppercase: false,
            numbers: true
        });
        var ip = randomip(node.subnet, node.subnetMask);

        var sshPort = await db.Port.findOne({
            node: node.code,
            isUsed: false
        });
        if (!sshPort) return await lib.error(interaction, 'No ports available. Please contact an administrator.', true);
        sshPort.isUsed = true;
        sshPort.intPort = 22;
        await sshPort.save();

        await interaction.editReply('Adding to queue...');

        var VPS = new db.VPS({
            userID: interaction.user.id,
            password,
            name,
            ip,
            sshPort: sshPort.port,
            sshPortID: sshPort._id,
            state: 'queued',
            isCreated: false,
            cost: (1/730/60),
            portLimit: user.portLimit,
            node: node.code,
            nodeIP: node.ip,
            shortID: Math.floor(1000 + Math.random() * 9000)
        });
        await VPS.save();

        console.log(`${shortID} has ${ip}`);

        var job = await queue.add(`vps_${interaction.user.id}-${Date.now()}`, {
            password,
            ip: VPS.ip,
            subnetMask: node.subnetMask,
            sshPort: sshPort.port,
            userID: interaction.user.id,
            nodeIP: node.ip,
            vpsID: VPS._id,
            node: node.code,
            portID: sshPort._id,
            shortID: VPS.stortID,
            storage: node.storage
        });
        VPS.jobID = job.id;
        await VPS.save();

        sshPort.vpsID = VPS._id;
        await sshPort.save();

        interaction.editReply(`**QUEUED**\nYour vps has been placed in the queue with queue ID ${job.id} and VPS ID ${VPS.shortID} on node \`${node.code}\``);
        console.log('after 5');
    }

}

module.exports = { default: CMD };
