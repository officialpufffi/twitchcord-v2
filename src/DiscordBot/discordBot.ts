import { handleDiscordMessage } from "../Utilities/discordChat";

const { Client, ActivityType, IntentsBitField } = require("discord.js");

export const discord_BOT_TOKEN = "abc";
export const GUILD_ID = "abc";
export const CLIENT_ID = "abc";

export const discordClient = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

discordClient.on("ready", () => {
    //console.log(`Logged in as ${client.user.tag}`);
    console.log("Discord Bot online! " + discordClient.user.tag);
    discordClient.user.setPresence({
        activities: [{ name: "mcdev_tv", type: ActivityType.Streaming, url: "https://www.twitch.tv/mcdev_tv" }],
        status: "idle",
    });
});


discordClient.on("messageCreate", handleDiscordMessage);
discordClient.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});


function connectDiscordBot() {
    discordClient.login(discord_BOT_TOKEN);
}

export { connectDiscordBot };
