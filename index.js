require('dotenv').config();

const { SlashCtrl } = require('slashctrl');
const path = require('path');
const { log } = console;

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
        client.createQueue[code] = new BullMQ.Queue(`${code}_create`, queueOptions);
        client.opsQueue[code] =  new BullMQ.Queue(`${code}_ops`, queueOptions);

        console.log(`> Created <Client>.createQueue[${code}] and .opsQueue[${code}]`);
    }
    
    calculateNodeSize();

    setInterval(calculateNodeSize, 15*1000);
});

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});


client.login(botToken);

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