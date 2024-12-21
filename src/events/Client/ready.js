const { log } = require("../../functions");
const ExtendedClient = require('../../class/ExtendedClient');
const { ActivityType, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const cfx = require("cfx-api");
require('dotenv').config();

const colors = require('colors');
const config = require('../../config');

module.exports = {
    event: 'ready',
    once: true,
    /**
     * 
     * @param {ExtendedClient} _ 
     * @param {import('discord.js').Client<true>} client 
     * @returns 
     */
    run: async (_, client) => {
        log('Logged in as: ' + client.user.tag, 'done');

        // Status rotation
        let activities = [
            {
                name: 'Farruko - Pepas',
                type: ActivityType.Streaming,
                url: `https://www.youtube.com/watch?v=p7VnVafawCc`
            },
            {
                name: (process.env.SERVER_NAME),
                type: ActivityType.Playing
            },
            {
                name: 'Sparky',
                type: ActivityType.Listening
            }
        ];

        setInterval(() => {
            let random = Math.floor(Math.random() * activities.length);
            client.user.setActivity(activities[random]);
        }, 10000);

        const msgChannel = client.channels.cache.get(process.env.STATUS_CHANNEL);

        // Check for required configurations
        let missingConfig = [];

        if (!process.env.ICON_URL) missingConfig.push("Icon URL");
        if (!process.env.EMBED_THUMBNAIL) missingConfig.push("Embed Thumbnail URL");
        if (!process.env.EMBED_IMAGE) missingConfig.push("Embed Image URL");
        if (!process.env.ACTU_STATUS_BOT) missingConfig.push("Status Bot Update Interval");
        if (!process.env.ACTU_STATUS_MSG) missingConfig.push("Status Message Update Interval");
        if (!process.env.SERVER_ID) missingConfig.push("Server ID");
        if (!process.env.SERVER_IP) missingConfig.push("Server IP");
        if (!process.env.STATUS_CHANNEL) missingConfig.push("Status Channel ID");

        if (missingConfig.length > 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("⚠️ Configuration Error")
                .setDescription("The following required configurations are missing:")
                .addFields({
                    name: "Missing Items:",
                    value: missingConfig.map(item => `❌ ${item}`).join('\n')
                })
                .addFields({
                    name: "What to do?",
                    value: "Please add the missing configurations in the .env file and restart the bot."
                })
                .setTimestamp();

            console.error("Missing configurations:", missingConfig.join(", "));
            await msgChannel.send({ embeds: [errorEmbed] });
            return;
        }

        try {
            await msgChannel.bulkDelete(100);
        } catch (e) {
            console.error("Error deleting messages:", e);
        }

        const initialMessage = await msgChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("#ff7f00")
                    .setDescription("<a:1044782209774665858:1306676903582634105> | Loading ..."),
            ],
        });

        setInterval(async () => {
            try {
                const server = await cfx.fetchServer(process.env.SERVER_ID);
                let pOnline = "";
                const listPlayer = server.players;

                if (listPlayer.length === 0) {
                    pOnline = "No connected player";
                } else {
                    pOnline = listPlayer.map(p => `\`${p.name}\``).join('\n');
                }

                const statusEmbed = new EmbedBuilder()
                    .setColor(process.env.EMBED_COLOR || "#ff00f7")
                    .setAuthor({
                        name: `${process.env.SERVER_NAME} | Server Status`,
                        iconURL: process.env. ICON_URL,
                    })
                    .addFields(
                        { name: ' ', value: ' ' },
                        {
                            name: "Server Name",
                            value: '```' + `${process.env.SERVER_NAME}` + '```',
                            inline: true,
                        },
                        { name: ' ', value: ' ' },
                        {
                            name: "How To Join The Server?",
                            value: `<a:1083568751913476196:1306676893797318707> You can join the **${process.env.SERVER_NAME}** using our IP: \`\`\` ${"connect play.genxrp.fun"}\`\`\``,
                        },
                        {
                            name: "**Server Status**",
                            value: '```' + `✅ Online` + '```',
                            inline: true,
                        },
                        {
                            name: "**Players Online**",
                            value: "```" + `  ${server.playersCount}/${server.maxPlayers}` + "```",
                            inline: true },
                        {
                            name: "**Restart Times**",
                            value: "```"+`${process.env.RESTART_TIME}`+"```",
                            inline: true,
                        },
                        {
                            name: ' ',
                            value: `<a:1083568751913476196:1306676893797318707> Live server status can be tracked below!!`
                        },
                        {
                            name: ' ',
                            value: `<a:745486297270976512:1306676884259733565>` + '**' + `${pOnline}` + '**'
                        }
                    )
                    .setThumbnail(process.env.EMBED_THUMBNAIL)
                    .setImage(process.env.EMBED_IMAGE)
                    .setTimestamp();
                
                const button = new ButtonBuilder()
                    .setLabel('Connect')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://cfx.re/join/y7yk75');
                
                const row = new ActionRowBuilder()
                    .addComponents(button);

                await initialMessage.edit({ embeds: [statusEmbed], components: [row] });

            } catch (err) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("⚠️ Error")
                    .setDescription("The server is currently `❌ Offline` or there was an error fetching information!")
                    .addFields({
                        name: "Error Details",
                        value: `\`\`\`${err.message}\`\`\``
                    })
                    .setTimestamp();

                await initialMessage.edit({ embeds: [errorEmbed] });
            }
        }, parseInt(process.env.ACTU_STATUS_MSG) * 1000 || 60000); // Default to 60 seconds if not set

        console.log(`[READY] ${client.user.tag} (${client.user.id}) is ready !`.green);

        let channelTicket = client.channels.cache.get(process.env.ticket_channel);
        await channelTicket.send({ content: "." });
        await channelTicket.bulkDelete(10);

        await channelTicket.send({
            embeds: [{
                title: "Ticket System",
                description: "Click The Button Below, To Open Ticket",
                color: Colors.Blue,
                footer: {
                    name: "Ticket System",
                },
                image: {
                    url: "https://i.ibb.co/WP1hRzW/TICKET.png"
                },
                timestamp: new Date(),
            }],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket')
                            .setLabel('Open a ticket')
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });
        
        await channelTicket.send({
            embeds: [{
                color: Colors.Blue,
                description: '\> \*\*Please avoid taking tickets for fun or creating unnecessary tickets, as this may result in a ban or timeout.\ \*\*'
            }]
        });
    }}