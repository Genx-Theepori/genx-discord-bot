const {
  ActionRowBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("connect")
    .setDescription("Sets up Command."),

  run: async (client, interaction) => {
    // Check if the user has the required role
    if (!interaction.member.roles.cache.has(config.roles.botacc.botaccrole)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const applyChannel = interaction.guild.channels.cache.get(config.staffping.connectapplychannel);
    if (!applyChannel) {
      return interaction.reply({
        content: "Apply channel not found.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Check if the message with the button already exists
    let existingMessage;
    try {
      const messages = await applyChannel.messages.fetch({ limit: 1 });
      existingMessage = messages.first();
    } catch (error) {
      console.error("Failed to fetch messages from the channel:", error);
      return interaction.editReply({
        content: "An error occurred while fetching messages.",
        ephemeral: true,
      });
    }

    // Create embed and button
    const embed = new EmbedBuilder()
      .setTitle("Apex Recast")
      .setAuthor({ name: "Apex"})
      .setColor("#FFEB3B")
      .setTimestamp()
      .setImage(
        "https://i.postimg.cc/m2R0kq8X/0dvxY4k4.png"
      )
      .addFields(
        {
          name: "Connect Fivem Website",
          value: "[Click Here](https://online.in/)",
          inline: true,
        },
        {
          name: "Connect via FiveM F8 Console",
          value: "```connect play.apecx.in```",
          inline: true,
        }
      );

    const button = new ButtonBuilder()
      .setLabel("Connect")
      .setURL("https://discord.gg/wWNkWkh6VE")
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    // Edit the existing message or send a new one
    try {
      if (existingMessage) {
        await existingMessage.edit({ embeds: [embed], components: [row] });
      } else {
        await applyChannel.send({ embeds: [embed], components: [row] });
      }
      await interaction.editReply({ content: "Connect message has been set up successfully." });
    } catch (error) {
      console.error("Failed to send/edit message:", error);
      await interaction.editReply({
        content: "An error occurred while setting up the message.",
        ephemeral: true,
      });
    }
  },
};
