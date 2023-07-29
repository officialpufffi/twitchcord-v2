import { CLIENT_ID, GUILD_ID, discord_BOT_TOKEN } from "../discordBot";

const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: "ping",
        discription: "replies with pong."
    }
]

const rest = new REST({ version : "10" }).setToken(discord_BOT_TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...")

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        )

        console.log("Slash commands were registered successfully!")
    } catch (error) {
        console.log("There was an error: " + error);
    }
})