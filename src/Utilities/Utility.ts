import { discordClient } from "../DiscordBot/discordBot";
import { AUTHORIZATION, CLIENT_ID, OAUTH, twitchClient } from "../TwitchBot/twitchBot";
import fs from 'fs';
import { ACCID, JWT_TOKEN } from "../setup";

export function sendDiscordMessage(channelId, message) {
    const channel = discordClient.channels.cache.get(channelId);

    if (!channel) {
        console.error('Invalid channel ID.');
        return;
    }
    channel.send(message);
}

export function sendTwitchMessage(channel, message) {
    twitchClient.say(channel, message);
}


export async function hasEnoughPoints(username: string, requiredPoints: number): Promise<boolean> {
    try {
      const userPoints = await getPoints(username);
      return userPoints >= requiredPoints;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Punkte für Benutzer ${username}:`, error);
      return false;
    }
  }

export function getPoints(username) {
    const channelName = ACCID

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            Authorization: 'Bearer ' + JWT_TOKEN
        },
    };
    return fetch(`https://api.streamelements.com/kappa/v2/points/${channelName}/${username}`, options)
        .then(response => response.json())
        .then(data => data.points)
        .catch(error => console.error(error));
}

export async function addPoints(username, amount) {
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + JWT_TOKEN
        },
        body: '{"users":[{"username":"' + username + '","current":' + amount + '}],"mode":"add"}'
    };
    try {
        const response = await fetch('https://api.streamelements.com/kappa/v2/points/' + ACCID, options);
        const text = await response.text();
        console.log(text);
    } catch (err) {
        console.error(err);
    }
}

export async function removePoints(username, amount) {
    const currentPoints = await getPoints(username);
    let pointsToSet = 0;
    if (currentPoints <= amount) {
        pointsToSet = 1
    } else {
        pointsToSet = currentPoints - amount
    }
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + JWT_TOKEN
        },
        body: '{"users":[{"username":"' + username + '","current":' + pointsToSet + '}],"mode":"set"}'
    };
    try {
        const response = await fetch('https://api.streamelements.com/kappa/v2/points/' + ACCID, options);
        const text = await response.text();
        console.log(text);
    } catch (err) {
        console.error(err);
    }
}


export function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function doSomethingWithProbability(chance) {
    const probability = chance;
    const randomValue = Math.random();

    if (randomValue < probability) {
        return true;
    } else {
        return false;
    }
}

export async function isChannelLive(channelName) {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': 'Bearer ' + OAUTH
        }
    });
    const data = await response.json();
    return data.data.length > 0;
}

export async function handleIsChannelLive(channel) {
    try {
        let isLive = await isChannelLive(channel);
        console.log("isChannelLive: " + isLive);
        return isLive;
    } catch (error) {
        console.error(error);
    }
}


// new stuff

const dataFilePath = 'data.json'

export function loadData() {
    try {
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        return data as Record<string, any>; // Oder spezifiziere den konkreten Typ für `data`
    } catch (err) {
        console.error(`Error while reading data file: ${err}`);
        return {};
    }
}

export function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (err) {
        console.error(`Error while writing data file: ${err}`);
    }
}

export function getUserData(username, data) {
    if (!data[username]) {
        data[username] = {
            lastStealUse: 0,
            usedStealCmd: 0,
            lastRobbed: 0,
            getRobbed: 0,
        };
    }
    return data[username];
}


// Watchtime


export async function getWatchtime(username) {
    const url = 'https://api.streamelements.com/kappa/v2/points/channel/watchtime';
    const options = { method: 'GET', headers: { Accept: '', Authorization: 'Bearer undefined' } };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}