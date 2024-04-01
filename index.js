require('dotenv').config();

const { SlashCtrl } = require('slashctrl');
const path = require('path');

var botToken = '';
var applicationId = '';

const slashCtrl = new SlashCtrl({
    token: botToken,
    applicationId: ''
});

slashCtrl.publishCommandsFromFolder(path.join(__dirname, 'commands'));

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});


client.login(botToken);