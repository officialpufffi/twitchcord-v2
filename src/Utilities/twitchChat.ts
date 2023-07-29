import { DISCORD_CHANNEL_ID } from "../setup";
import { sendDiscordMessage } from "./Utility";

export function logChat(channel, tags, message, self) {
    sendDiscordMessage(DISCORD_CHANNEL_ID, tags.username + ": " + message);
    console.log(tags.username + ": " + message);
}