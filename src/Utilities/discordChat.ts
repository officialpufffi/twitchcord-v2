import { STREAMER } from "../setup";
import { sendTwitchMessage } from "./Utility";

export function handleDiscordMessage(message) {
    if (message.author.bot && !(message.author.id === "abc")) return;
    if (message.content.startsWith(";")) {
        const command = message.content.slice(1);

        //console.log(message.author.id);
        console.log(message.author.username + "#" + message.author.discriminator + ": " + command);
        sendTwitchMessage("#"+STREAMER, command);
    }
}
