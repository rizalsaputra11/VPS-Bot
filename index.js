require('dotenv').config();

const { SlashCtrl } = require('slashctrl');
const path = require('path');
const { log } = console;

// var channel;

var botToken = process.env.DISCORD_TOKEN;
var applicationId = process.env.DISCORD_ID;

const slashCtrl = new SlashCtrl({
    token: botToken,
    applicationId: applicationId
});

var e = slashCtrl.publishCommandsFromFolder(path.join(__dirname, 'commands'));
console.log(e);

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const BullMQ = require('bullmq');

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // channel = client.channels.cache.get('1204045694164533269');

    var queueOptions = {
        connection: {
            host: process.env.REDIS_HOST,
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        }
    };

    // const queue = new BullMQ.Queue('de-f1_create', );

    client.createQueue = {};
    client.opsQueue = {};

    var db = require('./db');
    var nodes = await db.Node.find();

    for(let i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var code = node.code;

        // console.log(queueOptions)

        client.createQueue[code] = new BullMQ.Queue(`${code}_create`, queueOptions);
        client.opsQueue[code] =  new BullMQ.Queue(`${code}_ops`, queueOptions);

        registerEvents(`${code}_create`, queueOptions, client.createQueue[code]);
        registerEvents(`${code}_ops`, queueOptions, client.opsQueue[code]);

        console.log(`> Created <Client>.createQueue[${code}] and .opsQueue[${code}]`);
    }
    
    calculateNodeSize();

    setInterval(calculateNodeSize, 30*1000);
});

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});


client.login(botToken);

function registerEvents(name, queueOptions, q) {
    const events = new BullMQ.QueueEvents(name, queueOptions);

    events.on('waiting', ({ jobId }) => {
        console.log(`[${name}] A job with ID ${jobId} is waiting`);
    });
    
    events.on('active', ({ jobId, prev }) => {
        console.log(`[${name}] Job ${jobId} is now active; previous status was ${prev}`);
    });
    
    events.on('completed', async ({ jobId, returnvalue }) => {
        console.log(`[${name}] ${jobId} has completed and returned ${returnvalue}`, returnvalue);

        var job = await q.getJob(jobId);
        var data = job.data;

        if (returnvalue.ok == true) {
            try {
                var userID = data.userID;

                var db = require('./db');
                var VPS = await db.VPS.findOne({
                    _id: returnvalue.vpsID
                });
                if (!VPS) return console.log('VPS NOT FOUND?!!?!?111');
                VPS.proxID = returnvalue.proxID;
                await VPS.save();

                var conn = '';

                conn += '```bash';
                conn += `ssh root@${VPS.nodeIP} -p ${VPS.sshPort}`
                conn += '```';

                client.users.send(userID, `> **VPS Created!**\n> \t\tHello. Your vps has been created!\n> This message will contain the details of your vps.\n\n> VPS ID: \`${returnvalue.node}-${returnvalue.proxID}\`\n> SSH Port: ${VPS.sshPort}\n> Username: root\n> Password: ||\`${VPS.password}\`||\n\n> Connect to your vps by executing this in a terminal:\n${conn}`);
            } catch(e) {
                console.log(`> Failed to send ${data.userID} a DM: ${String(e)}`);
            }
        } else {
            var userID = data.userID;
            client.users.send(userID, `> **Create failed :x:!**\n> \t\tHello. Your vps has failed to create :(`);
        }
    });

    events.on('progress', async ({ jobId, returnvalue, mau }) => {
        console.log(`[${name}] ${jobId} has progress and returned ${returnvalue}`, returnvalue, mau);
        console.log('> ' + (await q.getJob(jobId)).progress);
    });
    
    events.on('failed', ({ jobId, failedReason }) => {
        console.log(`[${name}] ${jobId} has failed with reason ${failedReason}`);
    });

}

async function calculateNodeSize() {
    const db = require('./db');
    log('> Calculating node size...');

    var vpsPerNode = {};
    var nodeVPSLimit = {};

    var nodes = await db.Node.find();
    log(`Found ${nodes.length} nodes`);

    for(let i = 0; i < nodes.length; i++) {

        var node = nodes[i];

        nodeVPSLimit[node.code] = node.vpsLimit;
        vpsPerNode[node.code] = 0;

        var vpsOnNode = await db.VPS.find({ node: node.code });
        // console.log(vpsOnNode);
        vpsPerNode[node.code] = vpsOnNode.length;

        var no = await db.Node.findOne({ code: node.code });
        no.vpsCount = vpsOnNode.length;

        no.percent = (no.vpsCount/no.vpsLimit)*100;

        if (vpsOnNode.length >= no.vpsLimit) {
            no.isFull = true;
        } else {
            no.isFull = false;
        }

        await no.save();

    }
    log(vpsPerNode, nodeVPSLimit);
    
    log('> Checked nodes!');
}