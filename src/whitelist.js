require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require("discord.js");
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require("canvas");
const fetch = require('node-fetch');
const path = require('path');

module.exports = async client => {
  client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
      if (interaction.customId === "ap_apply") {
        // Create and show the application modal
        const modal = new ModalBuilder()
          .setTitle("Whitelist Applications")
          .setCustomId("application_modal");

        const usernameInput = new TextInputBuilder()
          .setCustomId("ap_username")
          .setLabel("Charater Name")
          .setMinLength(5)
          .setMaxLength(30)
          .setRequired(true)
          .setPlaceholder("Enter Character Name")
          .setStyle(TextInputStyle.Short);

        const teamNameInput = new TextInputBuilder()
          .setCustomId("ap_userage")
          .setLabel("IRL Age")
          .setMinLength(2)
          .setMaxLength(2)
          .setRequired(true)
          .setPlaceholder("Enter Your Age")
          .setStyle(TextInputStyle.Short);

        const playerNamesInput = new TextInputBuilder()
          .setCustomId("ap_useringameName")
          .setLabel("What Role Are You Going To Play ?")
          .setMinLength(3)
          .setMaxLength(10)
          .setRequired(true)
          .setPlaceholder("1.Civilian \n2.Police \n3.EMS")
          .setStyle(TextInputStyle.Short);

        const emailInput = new TextInputBuilder()
          .setCustomId("ap_useremail")
          .setLabel("Do You Have Previous Experience ?")
          .setMinLength(2)
          .setMaxLength(3)
          .setRequired(true)
          .setPlaceholder("Yes/No")
          .setStyle(TextInputStyle.Short);

        const rulesReadInput = new TextInputBuilder()
          .setCustomId("ap_userexp")
          .setLabel("Did you read the rules and regulations?")
          .setMinLength(2)
          .setMaxLength(3)
          .setRequired(true)
          .setPlaceholder("Yes/No")
          .setStyle(TextInputStyle.Short);

        // Add each TextInputBuilder to its own ActionRowBuilder, then add to the modal
        modal.addComponents(
          new ActionRowBuilder().addComponents(usernameInput),
          new ActionRowBuilder().addComponents(teamNameInput),
          new ActionRowBuilder().addComponents(playerNamesInput),
          new ActionRowBuilder().addComponents(emailInput),
          new ActionRowBuilder().addComponents(rulesReadInput)
        );

        try {
          await interaction.showModal(modal);
        } catch (error) {
          console.error("Error Showing Modals:", error);
        }

        console.log(`Whitelist button clicked by: ${interaction.user.username}`);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "application_modal") {
        // Retrieve input values
        let username = interaction.fields.getTextInputValue("ap_username");
        let age = interaction.fields.getTextInputValue("ap_userage");
        let ingameName = interaction.fields.getTextInputValue("ap_useringameName");
        let email = interaction.fields.getTextInputValue("ap_useremail");
        let rulesRead = interaction.fields.getTextInputValue('ap_userexp');

        // Log channel
        let logChannel = interaction.guild.channels.cache.get(process.env.LogChannel);

        if (!logChannel) return;

        // Read from Database.json to get the next enquiry ID
        let databaseContent;
        try {
          databaseContent = fs.readFileSync("Database.json", 'utf8');
        } catch (error) {
          console.error("Error reading Database.json:", error);
          return;
        }

        let databaseJson;
        try {
          databaseJson = JSON.parse(databaseContent);
        } catch (error) {
          console.error("Error parsing Database.json:", error);
          return;
        }

        let enquiryID = databaseJson.id;

        // Create embed for the application log
        const applicationEmbed = new EmbedBuilder()
          .setColor("#FFEB3B")
          .addFields([
            { name: "Enquiry ID", value: `\`\`\`${enquiryID}\`\`\``, inline: false },
            { name: "Character Name", value: `\`\`\`${username}\`\`\``, inline: false },
            { name: "Age ", value: `\`\`\`${age}\`\`\``, inline: false },
            { name: "Role", value: `\`\`\`${ingameName}\`\`\``, inline: false },
            { name: "Experience", value: `\`\`\`${email}\`\`\``, inline: false },
            { name: "Rules Read", value: `\`\`\`${rulesRead}\`\`\``, inline: false }
          ])
          .setFooter({ text: `${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        // Send application log to the log channel
        await logChannel.send({
          content: `Whitelist Application From <@${interaction.user.id}> \n @everyone`,
          embeds: [applicationEmbed]
        });

        // Acknowledge the application submission
        await interaction.reply({
          content: `Thank you for your application with code **#${enquiryID}**! We'll review it and be in touch.`,
          ephemeral: true
        });

        // Update the enquiry ID in Database.json
        databaseJson.id += 1;
        fs.writeFileSync("Database.json", JSON.stringify(databaseJson));

        // Notify user of application receipt
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: process.env.ServerName, iconURL: process.env.ServerLogo })
              .setColor('#FFEB3B')
              .addFields([
                { name: "Application Received", value: "Thank you for applying! We will respond shortly.", inline: true },
                { name: "Enquiry ID", value: `${enquiryID}`, inline: false }
              ])
              .setFooter({ text: process.env.ServerName })
          ]
        }).catch(() => {});
      }
    }
  });

  // Listen for reaction adds
client.on('messageReactionAdd', async (reaction, user, interaction) => {
    if (user.bot) return;

    try {
        // Fetch the message and its embed
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        // Check if the message contains an embed
        const embed = reaction.message.embeds[0];
        if (!embed) {
            console.error("No valid embed found in the message.");
            return;
        }

        const member = reaction.message.guild.members.cache.get(embed.footer.text);

        // Handle acceptance with ✅
        if (reaction.emoji.name === '✅' && embed.color === 0xFFEB3B) {
            console.log('Pending application handled');

            // Retrieve the application details from the existing embed fields
            const characterName = embed.fields.find(field => field.name === 'Character Name').value;
            const age = embed.fields.find(field => field.name === 'Age').value;
            const role = embed.fields.find(field => field.name === 'Role').value;
            const experience = embed.fields.find(field => field.name === 'Experience').value;
            const rulesRead = embed.fields.find(field => field.name === 'Rules Read').value;
            

      const approvedEmbed = new EmbedBuilder()
   .setColor('#2aff00')
   .setTitle('Application Approved')
   .addFields([
       { name: 'Character Name', value: characterName, inline: false },
       { name: 'Age', value: age, inline: false }, 
       { name: 'Role', value: role, inline: false },
       { name: 'Experience', value: experience, inline: false },
       { name: 'Rules Read', value: rulesRead, inline: false },
   ])
   .setFooter({
       text: `Approved by ${user.username} • ${new Date().toLocaleString()}`,
   });
            await reaction.message.edit({ embeds: [approvedEmbed] });
            // Optionally, send a confirmation message to the approval channel
            const channel = reaction.message.guild.channels.cache.get(process.env.PendingChannel);
            const enquiryCode = embed.fields[0].value;

            // Load the image for the ticket
            try {
                const response = await fetch('https://i.ibb.co/YbdRdC2/PENDING-Ticket.png');
                const buffer = await response.buffer();

                const pendingImage = await loadImage(buffer);

                const canvas = createCanvas(2000, 647);
                const ctx = canvas.getContext('2d');

                ctx.drawImage(pendingImage, 0, 0);

                // Set the custom font for text
                ctx.font = '33px Sans';
                ctx.fillStyle = "black";

                const currentDate = new Date();
                const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                const formattedTime = `${currentDate.getHours()}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

                // Adding text to the canvas
                ctx.fillText(member.user.username.toUpperCase(), 680,260);
                ctx.fillText(`${formattedDate}`, 1165,390);
                ctx.fillText(`${formattedTime}`, 1199,503)

                const imageBuffer = canvas.toBuffer("image/png");
                const attachment = new AttachmentBuilder(imageBuffer, { name: "ticket.png" });

                // Assign the "Pending" role to the member
                await member.roles.add(process.env.PendingRole);
                
await member.send({
    content: `🎉 Your whitelist application has been approved!`,
    embeds: [
        new EmbedBuilder()
            .setColor('#2aff00')
            .setTitle('Application Approved')
            .addFields([
                { name: ' ', value: `Your application has been approved by ${user.username}`, inline: false },
                { name: 'Next Steps', value: `Please visit <#${process.env.waitingchannel}> to complete \nthe process.`, inline: false }
            ])
        	.setFooter({ text: `${new Date().toLocaleString()}`})
    ],
    files: [attachment] // This line should be inside the object but after the embeds
});


                // Send the generated image to the channel
                await channel.send({
                    content: `<@${member.user.id}> ᴠɪꜱɪᴛ <#${process.env.waitingchannel}> ᴛᴏ ᴄᴏᴍᴘʟᴇᴛᴇ ᴛʜᴇ ᴘʀᴏᴄᴇᴅᴜʀᴇ.`,
                    files: [attachment]
                });

            } catch (error) {
                console.error("Error generating pending ticket image:", error);
            }
        }

        // Handle rejection with ❌
  if (reaction.emoji.name === '❌' && embed.color === 0xFFEB3B) {
   console.log('Application rejected');

   // Retrieve the application details
   const characterName = embed.fields.find(field => field.name === 'Character Name').value;
   const age = embed.fields.find(field => field.name === 'Age').value;
   const role = embed.fields.find(field => field.name === 'Role').value;
   const experience = embed.fields.find(field => field.name === 'Experience').value;
   const rulesRead = embed.fields.find(field => field.name === 'Rules Read').value;

   const rejectEmbed = new EmbedBuilder()
       .setColor('#FF0000')
       .setTitle('Application Rejected')
       .addFields([
           { name: 'Character Name', value: characterName, inline: false },
           { name: 'Age', value: age, inline: false },
           { name: 'Role', value: role, inline: false },
           { name: 'Experience', value: experience, inline: false },
           { name: 'Rules Read', value: rulesRead, inline: false },
       ])
       .setFooter({
           text: `Rejected by ${user.username} • ${new Date().toLocaleString()}`,
       });

   await reaction.message.edit({ embeds: [rejectEmbed] });
            // Send rejection button to the user
            const rejectionButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('rejection_reason_button')
                    .setLabel('Enter Rejection Reason')
                    .setStyle(ButtonStyle.Danger)
            );

            await reaction.message.channel.send({
                content: `Please provide a rejection reason by clicking the button below.`,
                components: [rejectionButton],
            });

        }
    } catch (error) {
        console.error("Error handling message reaction:", error);
    }
});

// Handle button interaction to open the rejection modal
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'rejection_reason_button') {
        // Create a modal to input the rejection reason
        const modal = new ModalBuilder()
            .setCustomId('rejection_modal')
            .setTitle('Rejection Reason')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('reason_input')
                        .setLabel('Enter the reason for rejection')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setMaxLength(1000)
                )
            );

        // Show the modal to the user who clicked the button
        await interaction.showModal(modal);
    }
});

// Handle modal submission and send rejection reason to the user and rejection channel
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return; // Ensure this is a modal submission

    if (interaction.customId === 'rejection_modal') {
        const reason = interaction.fields.getTextInputValue('reason_input');
        const member = await interaction.guild.members.fetch(interaction.user.id);
		await interaction.reply({ content: 'Rejection reason has been successfully sent to the user.', ephemeral: true });
        await interaction.channel.bulkDelete(1)
        try {

            const response = await fetch('https://r2.fivemanage.com/pub/u7kf1862gmq5.png')
            const buffer = await response.buffer();
            const rejectimage = await loadImage(buffer);
            
            
                const canvas = createCanvas(2000, 647);
                const ctx = canvas.getContext('2d');

                ctx.drawImage(rejectimage, 0, 0);

                // Set the custom font for text
                ctx.font = '33px Sans';
                ctx.fillStyle = "black";

                const currentDate = new Date();
                const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                const formattedTime = `${currentDate.getHours()}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

                // Adding text to the canvas
                ctx.fillText(member.user.username.toUpperCase(), 680,260);
                ctx.fillText(`${formattedDate}`, 1165,390);
                ctx.fillText(`${formattedTime}`, 1199,503)

            const imageBuffer = canvas.toBuffer('image/png');
            const Rattachment = new AttachmentBuilder(imageBuffer, { name: 'rejectimage.png' });
            
            
            // Send the rejection reason to the user
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF5733') // Red color for rejection
                        .setTitle('Application Rejected')
                        .setDescription(`Hello ${member.user.username},\n\nUnfortunately, your whitelist application has been rejected.\n\nRejection Reason: ${reason}\n\nPlease review your application and feel free to apply again later.`)
                        .setFooter({ text: process.env.ServerName })
                ], files: [Rattachment]
            }).catch(() => {});

            
            // Optionally, remove the Pending role if needed
            await member.roles.remove(process.env.PendingRole);

            // Send the rejection reason to the rejection channel
            const rejectChannel = interaction.guild.channels.cache.get(process.env.RejectChannel);
            if (rejectChannel) {
                const rejectionEmbed = new EmbedBuilder()
                    .setColor('#FF5733') // Red color for rejection
                    .addFields([
                        { name: 'Application Status', value: 'Rejected', inline: false },
                        { name: ' ', value: ' '},
                        { name: 'Rejection Reason', value: reason, inline: false },
                        { name: ' ', value: ' '},
                        { name: 'Rejected By', value: `<@${interaction.user.id}>`, inline: false },
                        { name: ' ', value: ' '},
                        { name: 'Rejected Member', value: `<@${member.user.id}>`, inline: false }
                    ])
                    .setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                await rejectChannel.send({ files: [Rattachment],embeds: [rejectionEmbed] });
            }
            
			
            // Acknowledge the modal submission
           
			
        } catch (error) {
            console.error('Error submitting rejection reason:', error);
            await interaction.reply({ content: 'There was an error while processing the rejection. Please try again later.', ephemeral: true });
        }
    }
});
};
