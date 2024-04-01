async function checkAdmin(command, interaction) {
    if (command.requiresAdmin == false) return false;

    var userID = interaction.user.id;
    var admins = String(process.env.DISCORD_OWNERS).split(',');

    if (admins.includes(userID)) return false;

    await interaction.reply(`This command requires admin.`);
}
module.exports = {
    checkAdmin
};