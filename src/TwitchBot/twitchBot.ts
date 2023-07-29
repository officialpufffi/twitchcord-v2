import { logChat } from "../Utilities/twitchChat";
import { stealCmd } from "./commands/stealCmd";
import { testCmd } from "./commands/testCmd";
import { brCmd } from "./commands/brCmd";
import { STREAMER } from "../setup";

const tmi = require('tmi.js');

const BOT_TOKEN = "abc";
export const CLIENT_ID = "abc";
export const CLIENT_SECRET = "abc";
export const OAUTH = "abc"; // 60 Tage
export const AUTHORIZATION = "abc";

const opts =
{
    identity:
    {
        username: "pufffibot",
        password: "oauth:" + BOT_TOKEN
    },
    channels:
    [
        STREAMER
    ]
};

export const twitchClient = new tmi.client(opts);

twitchClient.on("connected", (address, port) => {
    console.log("Twitch Bot online! " + opts.identity.username);
})

twitchClient.on("message", logChat);
twitchClient.on("message", testCmd);
//twitchClient.on("message", stealCmd);
twitchClient.on("message", brCmd);

function connectTwitchBot() {
    twitchClient.connect();
}

export { connectTwitchBot };
