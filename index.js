require('dotenv').config();
const ExtendedClient = require('./src/class/ExtendedClient');
const { Client, GatewayIntentBits, SlashCommandBuilder, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const {updatePlayerCount} = require("./src/status");




//const client = new ExtendedClient();
const client = new ExtendedClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions
    ],
  });




client.start();
client.setMaxListeners(15);
client.on("ready", async () => {
    console.log(`Bot ${client.user.tag} is now online.`);
    updatePlayerCount(client, process.env.SecondsToUpdateStatus)
    const commands = new SlashCommandBuilder()
      .setName("setup-apply")
      .setDescription("This command will send a message to the dedicated channel")
      
      .setName("applisetup")
      .setDescription("This command will send a message to the dedicated channel")
  
      .setName("acceptwl")
      .addSubcommand(subcommand =>
        subcommand
          .setName("user")
          .setDescription('This will give whitelist role to mentioned user and automatically send whitelist message to channel')
          .addUserOption(option => option.setName('user').setDescription('Mention the user to give the whitelist').setRequired(true)))
  
    client.application.commands.create(commands)
  
    require("./src/whitelist")(client);
  });
 


  //client.login(process.env.BOT_TOKEN);

  client.once('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
  });
  
  // Function to create the embed message
function getEmbedMessage(config) {
  const embed = new EmbedBuilder()
      .setAuthor({
          name: config.serverName || 'Unknown Server',
          iconURL: config.serverLogo || null // Set to null if not available
      })
      .setColor(config.color || '#FFFFFF') // Default color if not provided
      .setFooter({
          text: config.serverName || 'Unknown Server',
          iconURL: config.serverLogo || null // Set to null if not available
      })
      .setTimestamp(new Date());

  // Only set the image if it is provided and valid
  if (config.runningImage && isValidUrl(config.runningImage)) {
      embed.setImage(config.runningImage);
  } else if (config.maintenanceGif && isValidUrl(config.maintenanceGif)) {
      embed.setImage(config.maintenanceGif);
  }

  // Only set the thumbnail if it is provided and valid
  if (config.thumbnailImage && isValidUrl(config.thumbnailImage)) {
      embed.setThumbnail(config.thumbnailImage);
  }

  return embed;
}

// Function to validate URLs
function isValidUrl(string) {
  try {
      new URL(string);
      return true;
  } catch (_) {
      return false;  
  }
}

// Function to create buttons
function createButtons() {
  return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
          .setCustomId('online')
          .setLabel('Set Online')
          .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
          .setCustomId('maintenance')
          .setLabel('Set Maintenance')
          .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
          .setCustomId('restart')
          .setLabel('Restart Server')
          .setStyle(ButtonStyle.Primary)
  );
}

// Event: Handle button interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return; // Check if the interaction is a button interaction

  let channel = client.channels.cache.get(process.env.MAINTENANCE_CHANNEL);
  if (!channel) {
      console.error('Maintenance channel not found.');
      return;
  }

  let messageContent;
  let embedFields;
  let runningImage = null;
  let maintenanceGif = null;
  let embedColor;
  let thumbnailImage = process.env.THUMBNAIL_IMAGE; // Use a single thumbnail image for all cases

  switch (interaction.customId) {
      case 'online':
          messageContent = `||<@&${process.env.WHITE_LIST_ROLE}>||`;
          embedFields = {
              name: ' \n\n',
              value: `**To the citizens of ${process.env.SERVER_NAME}**` + '\n\n**🟢 Server is now online 🟢**' + '\n' + '\n```Enjoy roleplay!```',
              inline: false
          };
          runningImage = process.env.RUNNING_IMAGE; // Set the running image
          embedColor = '#00FF00'; // Green color for online
          break;
      case 'maintenance':
          messageContent = `||<@&${process.env.WHITE_LIST_ROLE}>||`;
          embedFields = {
              name: ' ',
              value: `**To the citizens of ${process.env.SERVER_NAME}**` +
              `\n\n` +
              `⚒️ **SERVER IS GOING FOR MAINTENANCE!!\n**`,
              inline: false
          };
          maintenanceGif = process.env.MAINTENANCE_GIF; // Set the maintenance GIF
          embedColor = '#FF0000'; // Red color for maintenance
          break;
      case 'restart':
          messageContent = `||<@&${process.env.WHITE_LIST_ROLE}>||`;
          embedFields = {
              name: ' \n\n',
              value: '**🟢 Server Restarted 🟢**' + '\n\n' + '🔄 **The server has been restarted successfully!**',
              inline: false
          };
          runningImage = process.env.RESTARTED_GIF; // Set the running image
          embedColor = '#FFFF00'; // Yellow color for restart
          break;
      default:
          return; // Exit if the customId does not match any case
  }

  try {
      await channel.send({
          content: messageContent,
          embeds: [
              getEmbedMessage({
                  serverName: process.env.SERVER_NAME,
                  serverLogo: process.env.SERVER_LOGO,
                  runningImage: runningImage, // Pass the running image or null
                  maintenanceGif: maintenanceGif, // Pass the maintenance gif or null
                  color: embedColor, // Pass the appropriate color
                  thumbnailImage: thumbnailImage // Pass the thumbnail image
              }).addFields(embedFields)
          ]
      });
      await interaction.reply({ content: 'Status updated successfully!', ephemeral: true });
  } catch (error) {
      console.error('Failed to send message:', error);
      await interaction.reply({ content: 'Failed to update status.', ephemeral: true });
  }
});

// Event: Handle message commands
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return; // Ignore bot messages
  if (message.content === '!status') {
      const buttons = createButtons();
      await message.channel.send({
          content: 'Select the server status:',
          components: [buttons]
      });
  }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit()) {
        const sayCommand = require('./src/commands/slash/Utility/say');
        await sayCommand.handleModalSubmit(interaction);
    }
});


// Handles errors and avoids crashes
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);