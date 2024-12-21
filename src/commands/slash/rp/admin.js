const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  'structure': new SlashCommandBuilder()
    .setName("admin")
    .setDescription("This command will send a message to the dedicated channel"),
  'options': {
    'cooldown': 5000  // Cooldown in milliseconds (5000 ms = 5 seconds)
  },
  'run': async (client, interaction) => {  // Replacing _0x583de9 with 'client' and _0x105d62 with 'interaction'
    if (!interaction.isCommand() && !interaction.isButton() && 
        !interaction.isModalSubmit() && !interaction.showModal()) {
      return;  // Exit if the interaction is not a command, button, or modal submission
    }

    // Check if the interaction is a command
    if (interaction.isCommand()) {
      if (interaction.commandName == "admin") {
        // Fetch the admin channel using its ID stored in environment variables
        let adminChannel = client.channels.cache.get(process.env.AdminChannel);
        if (!adminChannel) {
          return;  // Exit if the admin channel is not found
        }

        // Check if the user has the required role to execute this command
        let hasRole = interaction.member.roles.cache.has(process.env.InteractionRole);
        if (hasRole) {
          // Create action buttons for the server management options
          let actionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setStyle(ButtonStyle.Success)
              .setCustomId('restart')
              .setLabel("Server Restart")
              .setEmoji('⭕'),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setCustomId('main')
              .setLabel("Server Maintenance")
              .setEmoji('⚠'),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Danger)
              .setCustomId("online")
              .setLabel("Server Online")
              .setEmoji('✔')
          ]);

          // Send an embedded message to the admin channel with server announcement info
          adminChannel.send({
            'embeds': [
              new EmbedBuilder()
                .setColor("#00e5ff")
                .setTitle("Server Announcement")
                .setTimestamp(new Date())
                .setFooter({
                  'text': "Developed by Its Me",
                  'iconURL': process.env.ServerLogo
                })
            ],
            'components': [actionRow]
          });

          // Reply to the user confirming the message was sent
          interaction.reply({
            'content': "admin in " + adminChannel
          });
        } else {
          // If the user lacks the required role, send an ephemeral message
          interaction.reply({
            'content': "You don't have the privilege to do this command. Contact admins for more information.",
            'ephemeral': true
          });
        }
      }
    }
  }
};
