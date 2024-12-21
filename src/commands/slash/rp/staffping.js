const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../config");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("staffping")
    .setDescription("Shows online staff members."),

  run: async (client, interaction) => {
    // Check if the user has the required role
    if (!interaction.member.roles.cache.has(config.roles.botacc.botaccrole)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let onlineRole = interaction.guild.roles.cache.get(config.staffping.onlinerole);
    let staffRole = interaction.guild.roles.cache.get(config.staffping.staffrole);
    if (!onlineRole || !staffRole) {
      console.error("Online role or staff role not found in the config file.");
      return interaction.editReply({
        content: "An error occurred. Please contact the bot administrator.",
        ephemeral: true,
      });
    }

    try {
      // Fetch all members of the guild
      await interaction.guild.members.fetch({ force: true });

      // Filter members who have the online role and are online
      const onlineMembers = interaction.guild.members.cache.filter(
        (member) =>
          member.roles.cache.has(onlineRole.id) &&
          member.roles.cache.has(staffRole.id) &&
          (member.presence?.status === "online" || member.presence?.status === "dnd")
      );

      // Create an embed with the online staff members
      const embed = new EmbedBuilder()
        .setTitle("✨ Online Staff Members ✨")
        .setColor(0x00ff00)
        .setDescription(
          onlineMembers.size > 0
            ? `Currently Online Staff: ${onlineMembers.size}/${interaction.guild.members.cache.filter(member => member.roles.cache.has(staffRole.id)).size}\n\n` +
              onlineMembers.map((member) => `• <@${member.user.id}>`).join("\n")
            : "🚫 No staff members are currently online."
        )
        .setFooter({ text: "Staff Ping System" })
        .setTimestamp();

      // Send the embed as a reply to the command
      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error fetching members:", error);
      await interaction.editReply({
        content: "Failed to fetch members. Please try again later.",
        ephemeral: true,
      });
    }
  },
};