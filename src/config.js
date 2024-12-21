module.exports = {

    client: {

        token: "MTMwOTE1NjAxMTc2Mzk1NzgzMQ.GjQngT.5Ei4s046ypvcKyYEZqHE5PQYcHtEVnMAhdXNOk",

        id: "1309156011763957831",

    },

    emojis: {

        ticket: "ðŸŽ«",

        success: "âœ…",

        error: "ðŸš«",

    },

    handler: {

        prefix: "*",

        deploy: true,

        commands: {

            prefix: true,

            slash: true,

            user: true,

            message: true,

        },

        mongodb: {

            enabled: true,

            url: "mongodb+srv://nooicee5:Godofwar@ragnarock2008@cluster0.oemy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

        },

    },

    users: {

        developers: ["824348199137050704"]

    },

roles:{
    botacc:{
        botaccrole:"1231691293051326506"
        },
    },
    staffping: {
   connectapplychannel:"1302802005743636523",
    applychannel: "1302802005743636523",
    onlinerole: "1232632112784347156",
    staffrole:"1292314349674827836",
  },

    development: { 

        enabled: true,

        guild: "1231684457023406174",

    }, 

    messageSettings: {

        nsfwMessage: "The current channel is not a NSFW channel.",

        developerMessage: "You are not authorized to use this command.",

        cooldownMessage: "Slow down buddy! You're too fast to use this command.",

        globalCooldownMessage: "Slow down buddy! This command is on a global cooldown.",

        notHasPermissionMessage: "You do not have the permission to use this command.",

        notHasPermissionComponent: "You do not have the permission to use this component.",

        missingDevIDsMessage: "This is a developer only command, but unable to execute due to missing user IDs in configuration file."

    },

};