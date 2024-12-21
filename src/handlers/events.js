const { readdirSync, lstatSync } = require('fs');
const { log } = require('../functions');
const ExtendedClient = require('../class/ExtendedClient');

/**
 * 
 * @param {ExtendedClient} client 
 */
module.exports = (client) => {
    // Read the events folder
    for (const dir of readdirSync('./src/events/')) {
        const dirPath = './src/events/' + dir;

        // Check if dir is a directory
        if (lstatSync(dirPath).isDirectory()) {
            // Read files inside the directory
            for (const file of readdirSync(dirPath).filter((f) => f.endsWith('.js'))) {
                const module = require('../events/' + dir + '/' + file);

                if (!module) continue;

                if (!module.event || !module.run) {
                    log('Unable to load the event ' + file + ' due to missing \'name\' or/and \'run\' properties.', 'warn');
                    continue;
                };

                log('Loaded new event: ' + file, 'info');

                if (module.once) {
                    client.once(module.event, (...args) => module.run(client, ...args));
                } else {
                    client.on(module.event, (...args) => module.run(client, ...args));
                };
            };
        } else {
            // If it's not a directory, log a warning
            log(`${dir} is not a directory and was skipped.`, 'warn');
        }
    };
};
