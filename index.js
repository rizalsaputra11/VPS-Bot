require('dotenv').config();

const { SlashCtrl } = require('slashctrl');
const path = require('path');

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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const queue = new BullMQ.Queue('de-f1_create', {
        connection: {
            host: process.env.REDIS_HOST,
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            port: process.env.REDIS_PORT
        }
    });

    client.queue = queue;
    
});

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});


client.login(botToken);