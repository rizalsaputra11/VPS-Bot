const db = require('./db');

async function checkAdmin(command, interaction) {
    if (command.requiresAdmin == false) return false;

    var userID = interaction.user.id;
    var admins = String(process.env.DISCORD_OWNERS).split(',');

    console.log('a', userID, admins, admins.includes(userID));

    if (admins.includes(userID)) return false;

    await interaction.reply(`> **This command is admin only!**`);
    return true;
}
async function getUser(interaction) {
    var userID = interaction.user.id;

    var user = await db.User.findOne({
        userID: userID
    });
    
    if (!user) {
        user = new db.User({
            userID,
            balance: 0,
            vpsLimit: 1,
            plan: 'free',
            isBanned: false,
            banReason: ''
        });
        await user.save();

    }

    return user;
}
module.exports = {
    checkAdmin,
    getUser
};