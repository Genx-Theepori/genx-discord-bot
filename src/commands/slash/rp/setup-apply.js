const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("setup-apply")
    .setDescription("This command will send a message to the dedicated channel"),
  options: {
    cooldown: 0x1388 // Cooldown in milliseconds (5000 ms)
  },
  run: async (interaction, command) => {
    // Check if the interaction is a command, button, or modal submit
    if (!command.isCommand() && !command.isButton() && !command.isModalSubmit() && !command.showModal()) {
      return;
    }

    // Handle command
    if (command.isCommand()) {
      if (command.commandName === 'setup-apply') {
        // Get the apply channel from the environment variable
        let applyChannel = interaction.channels.cache.get(process.env.ApplyChannel);
        if (!applyChannel) {
          return; // Exit if the channel doesn't exist
        }

        // Check if the member has the required role
        let hasInteractionRole = command.member.roles.cache.has(process.env.InteractionRole);
        if (hasInteractionRole) {
          // Create buttons for application types
          let actionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setStyle(ButtonStyle.Danger)
              .setCustomId("ap_apply")
              .setLabel("Apply")
              .setEmoji('📑'),
          ]);

          // Send the embed message to the apply channel
          applyChannel.send({
            embeds: [new EmbedBuilder()
              .setAuthor({
                name: process.env.ServerName,
                iconURL: process.env.ServerLogo
              })
              .setColor('#FF0000')
              .setFooter({
                text: process.env.ServerName
              })
              .setTimestamp(new Date())
              .setTitle("WHITELIST APPLICATIONS")
              .setImage('https://i.ibb.co/cwn9FDt/whitelist3.png')
            ],
            components: [actionRow]
          });

          // Reply to the user confirming the setup
          command.reply({
            content: "> setup-apply in " + applyChannel
          });
        } else {
          // Reply with an error message if the user doesn't have the role
          command.reply({
            content: "You don't have the privilege to do this command. Contact Admins for more information.",
            ephemeral: true
          });
        }
      }
    }
  }
};