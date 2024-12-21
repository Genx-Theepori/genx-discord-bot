const axios = require("axios");
const { ActivityType } = require('discord.js');

module.exports = {
  'updatePlayerCount': (client, interval) => {
    const serverInfoUrl = `http://${process.env.SERVER_IP}/dynamic.json`;
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchServerInfo() {
      try {
        const response = await axios.get(serverInfoUrl, { timeout: 5000 }); 
        if (response.status === 200 && response.data.clients !== undefined) {
          const playerCount = `${response.data.clients}/${response.data.sv_maxclients} Players`;
          client.user.setActivity(playerCount, { type: ActivityType.Watching });
          retryCount = 0; 
        } else {
          throw new Error("Invalid server response");
        }
      } catch (error) {
        console.error(`Error fetching server info (Attempt ${retryCount + 1}/${maxRetries}):`, error.message);
        
        if (++retryCount < maxRetries) {
          console.log(`Retrying in ${interval} seconds...`);
          return; 
        }
        

        client.user.setActivity("Server Unavailable", { type: ActivityType.Watching });
        retryCount = 0;
      }
    }

    setInterval(fetchServerInfo, interval * 1000);
  }
};