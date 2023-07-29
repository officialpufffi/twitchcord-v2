import { time } from "discord.js";
import { addPoints, doSomethingWithProbability, getPoints, hasEnoughPoints, removePoints } from "../../Utilities/Utility";
import { twitchClient } from "../twitchBot";
import { BR_FIGHT_TIME, BR_JOIN_FEE, BR_MIN_PLAYERS, BR_TIME_TO_JOIN, STREAMER } from "../../setup";

const availableStartCmds = ["!brstart", "!startbr"];
const availableResetCmds = ["!brstop", "!stopbr", "!resetbr", "!brreset"];
let isStartable: boolean = true;
let isJoinable: boolean = false;

const userList: string[] = [];

let timeToJoin = BR_TIME_TO_JOIN;
let fightTime = BR_FIGHT_TIME;

export function brCmd(channel, tags, message, self) {
    if (self) return;
    if (availableStartCmds.includes(message)) {
        if (!(tags.username === "official_pufffi" || tags.username === STREAMER || tags.mod)) return;
        if (isStartable) {
            timeToJoinCountdown(channel);
        } else {
            twitchClient.say(channel, "Es läuft bereits ein Battle Royale!");
        }
    }
    else if (availableResetCmds.includes(message)) {
        resetBr();
    }
    else if (message === "!br") {
        letUserJoinIfHeCan(channel, tags.username);
    }
}

// let user join if he can lol
async function letUserJoinIfHeCan(channel, username) {
    if (!isJoinable) return;
    const hasEnough = await hasEnoughPoints(username, BR_JOIN_FEE);
    if (!hasEnough) {
        twitchClient.say(channel, username + ", du hast nicht genug " + STREAMER + ".");
        return;
    }
    if (!isUserInList(username)) {
        removePoints(username, BR_JOIN_FEE);
        addUser(username);
    }
}

// addUser
function addUser(user: string): void {
    if (!userList.includes(user)) {
        userList.push(user);
        console.log(`Benutzer ${user} wurde zur Liste hinzugefügt.`);
    } else {
        console.log(`Benutzer ${user} ist bereits in der Liste.`);
    }
}

// removeUser
function removeUser(user: string): void {
    const index = userList.indexOf(user);
    if (index !== -1) {
        userList.splice(index, 1);
        console.log(`Benutzer ${user} wurde aus der Liste entfernt.`);
    } else {
        console.log(`Benutzer ${user} ist nicht in der Liste.`);
    }
}

// clearList
function clearList(): void {
    userList.length = 0;
    console.log('Die Liste wurde geleert.');
}

// checkIfUserIsInList
function isUserInList(user: string): boolean {
    return userList.includes(user);
}

// getUserCount
function getUserCount(): number {
    return userList.length;
}

// getRandomUser
function getRandomUser(): string | null {
    if (userList.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * userList.length);
    return userList[randomIndex];
}

// time to join
function timeToJoinCountdown(channel) {
    isStartable = false;
    isJoinable = true;
    clearList();
    let seconds = timeToJoin;

    twitchClient.say(channel, "Ein Battle Royale hat geöffnet. Tippe \"!br\" um mitzumachen.");

    const interval = setInterval(() => {
        if (seconds === 45 || seconds === 30 || seconds === 15) {
            //console.log("Battle Royale startet in " + seconds + " Sekunden. Tippe \"!br\" um dem Battle Royale beizutreten.");
            twitchClient.say(channel, "Battle Royale startet in " + seconds + " Sekunden. Tippe \"!br\" um dem Battle Royale beizutreten.");
        }
        if (seconds === 0) {
            clearInterval(interval);
            isJoinable = false;
            enoughPlayer(channel);
        }
        seconds--;
    }, 1000);

}

// start fight
function startFightCountdown(channel) {
    isStartable = false;
    isJoinable = false;
    let seconds = fightTime;

    twitchClient.say(channel, "Alle Teilnehmer für das Battle Royale fliegen auf die Insel und machen sich bereit zum Absprung!");

    const interval = setInterval(() => {
        if (seconds === 20 || seconds === 15 || seconds === 10 || seconds === 5) {
            if (getUserCount() >= 4) {
                let randomUser = getRandomUser();
                twitchClient.say(channel, randomUser + " ist leider aus dem Battle Royale ausgeschieden.");
                removeUser("" + randomUser);
            }
            else {
                twitchClient.say(channel, "Das Battle Royale endet in " + seconds + " Sekunden.")
            }
            //console.log("Battle Royale startet in " + seconds + " Sekunden. Tippe \"!br\" um dem Battle Royale beizutreten.");
            //twitchClient.say(channel, "Battle Royale startet in " + seconds + " Sekunden. Tippe \"!br\" um dem Battle Royale beizutreten.");
        }
        if (seconds === 0) {
            clearInterval(interval);
            determineWinners(channel);
        }
        seconds--;
    }, 1000);
}

// check if enough players in br
function enoughPlayer(channel) {
    if (getUserCount() >= BR_MIN_PLAYERS) {
        startFightCountdown(channel);
    }
    else {
        for (let i = 0; i < getUserCount(); i++) {
            const user = userList[i];
            addPoints(user, BR_JOIN_FEE);
            twitchClient.say(channel, "Es haben sich nicht genug Teilnehmer für das Battle Royale gefunden.");
            isStartable = true;
            isJoinable = false;
        }
    }
}

// selectWinners
function determineWinners(channel): void {
    const random = Math.random();
    const totalUsers = getUserCount();

    if (totalUsers <= 7) {
        if (random < 0.5) {
            const winnerCount = 1;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " hat " + priceForWinner + " gewonnen.");
        } else {
            const winnerCount = 2;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " haben " + priceForWinner + " gewonnen.");
        }
    }
    else {
        if (random < 0.1) {
            const winnerCount = 1;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " hat " + priceForWinner + " gewonnen.");
        } else if (random < 0.3) {
            const winnerCount = 2;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " haben " + priceForWinner + " gewonnen.");
        } else if (random < 0.6) {
            const winnerCount = 3;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " haben " + priceForWinner + " gewonnen.");
        } else {
            const winnerCount = 4;
            const winners = selectRandomUsers(winnerCount);
            const formattedWinners = formatNames(winners);
            const priceForWinner = calculateWin(winnerCount);
            winners.forEach((winner) => {
                addPoints(winner, priceForWinner);
            });
            twitchClient.say(channel, "Das Battle Royale ist vorbei und " + formattedWinners + " haben " + priceForWinner + " gewonnen.");
        }
    }
    resetBr();
}


// Funktion zum Auswahl zufälliger Benutzer aus der Liste
function selectRandomUsers(count: number): string[] {
    const shuffledUsers = shuffleArray(userList);
    return shuffledUsers.slice(0, count);
}

// Funktion zum Mischen eines Arrays
function shuffleArray(array: any[]): any[] {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatNames(names: string[]): string {
    const numNames = names.length;

    if (numNames === 0) {
        return '';
    } else if (numNames === 1) {
        return names[0];
    } else if (numNames === 2) {
        return `${names[0]} und ${names[1]}`;
    } else {
        const formattedNames = names.slice(0, numNames - 1).join(', ');
        return `${formattedNames} und ${names[numNames - 1]}`;
    }
}

function calculateWin(howManyWinners: number): number {
    let pricePool = 0;
    let priceForEach = 0;

    if (getUserCount() <= 20) {
        pricePool = BR_JOIN_FEE * getUserCount() + 5000;
        priceForEach = pricePool / howManyWinners;
    }
    else {
        pricePool = BR_JOIN_FEE * 20 + 5000;
        priceForEach = pricePool / howManyWinners;
    }
    return Math.floor(priceForEach);
}

function resetBr() {
    isStartable = true;
    isJoinable = false;
    clearList();
}