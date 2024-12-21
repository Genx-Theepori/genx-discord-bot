const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Says something by the bot")
        .addChannelOption((options) =>
            options
                .setName("channel")
                .setDescription("The channel you want to send the message")
                .setRequired(false)
        ),

    run: async (client, interaction) => {
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        const sayTitle = new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Embed Title (optional)")
            .setPlaceholder("Provide a title for the embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const sayQuestion = new TextInputBuilder()
            .setCustomId("say")
            .setLabel("Say something")
            .setPlaceholder("Type something...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const sayEmbed = new TextInputBuilder()
            .setCustomId("embed")
            .setLabel("Embed mode on/off?")
            .setPlaceholder("on/off")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const sayImage = new TextInputBuilder()
            .setCustomId("image")
            .setLabel("Image URL (optional)")
            .setPlaceholder("Provide a URL to an image")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const sayModal = new ModalBuilder()
            .setCustomId(`say-${channel.id}`)
            .setTitle("Say something through the bot");

        sayModal.addComponents(
            new ActionRowBuilder().addComponents(sayTitle),
            new ActionRowBuilder().addComponents(sayQuestion),
            new ActionRowBuilder().addComponents(sayEmbed),
            new ActionRowBuilder().addComponents(sayImage)
        );

        await interaction.showModal(sayModal);

        // Remove the event listener setup from the command file
        // Instead, handle the modal interaction in a separate event file
    },

    // Optional: Modal interaction handler (can be moved to a separate event file)
    async handleModalSubmit(modalInteraction) {
        if (!modalInteraction.customId.startsWith("say-")) return;

        // Defer the reply immediately to prevent InteractionNotReplied error
        await modalInteraction.deferReply({ ephemeral: true });

        try {
            const channelId = modalInteraction.customId.split("-")[1];
            const targetChannel = await modalInteraction.client.channels.fetch(channelId);

            const message = modalInteraction.fields.getTextInputValue("say").trim();
            const embedSay = modalInteraction.fields.getTextInputValue("embed").trim().toLowerCase();
            const imageUrl = modalInteraction.fields.getTextInputValue("image").trim();
            const embedTitle = modalInteraction.fields.getTextInputValue("title").trim();

            if (!message) {
                return await modalInteraction.editReply({
                    content: "You must provide a message.",
                });
            }

            if (embedSay === "on") {
                const embed = new EmbedBuilder()
                    .setDescription(message)
                    .setColor(process.env.EMB_COLOR);

                if (imageUrl) {
                    embed.setImage(imageUrl);
                }
                if (embedTitle) {
                    embed.setTitle(embedTitle);
                }

                await targetChannel.send({ embeds: [embed] });
            } else {
                await targetChannel.send(message);
            }

            await modalInteraction.editReply({
                content: "Your message has been successfully sent.",
            });
        } catch (error) {
            console.error(error);
            await modalInteraction.editReply({
                content: "An error occurred while sending the message. Please try again.",
            });
        }
    }
};