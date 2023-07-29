import { addPoints, doSomethingWithProbability, getPoints, getRandomNumber, getUserData, loadData, removePoints, saveData } from "../../Utilities/Utility";
import { GLOBEL_STEAL_DELAY, MAX_STEAL, MIN_STEAL, POINTS_NAME, ROB_PROTECTION, STEAL_DELAY } from "../../setup";
import { twitchClient } from "../twitchBot";

export function stealCmd(channel, tags, message, self) {
    if (self) return;

    if (message === "!steal") {
        twitchClient.say(channel, "coming soon...");
    }
    else if (message.startsWith("!steal ")) {
        const target = message.slice(("!steal ").length);
        //twitchClient.say(channel, "In theory you've robbed " + target);

        const currentTime = Date.now();
        const timeSinceLastStealCommand = currentTime - lastStealCommandTime;
        if (timeSinceLastStealCommand < GLOBEL_STEAL_DELAY*1000) {
            const remainingTime = GLOBEL_STEAL_DELAY*1000 - timeSinceLastStealCommand;
            //const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime) / 1000);
            twitchClient.say(channel, `Der Befehl kann erst in ${seconds} Sekunden wieder ausgeführt werden.`);
        } else {
            lastStealCommandTime = currentTime;
            handleStealCommand(tags, channel, target);
        }
    }
}

let lastStealCommandTime = 0;

async function handleStealCommand(userstate, channel, target) {
    const randomNumber = getRandomNumber(MIN_STEAL, MAX_STEAL);
    const currentUser = userstate.username;
    let targetUser = target;
    if (targetUser.startsWith('@')) {
        targetUser = targetUser.slice(1);
    }

    const now = Math.floor(Date.now() / 1000);
    const data = loadData();

    const currentUserObj = getUserData(currentUser, data);
    const targetUserObj = getUserData(targetUser, data);

    const currentUserLastStealUse = currentUserObj.lastStealUse;
    const currentUserDiff = now - currentUserLastStealUse;
    const targetLastRobbed = targetUserObj.lastRobbed;
    const targetUserDiff = now - targetLastRobbed;

    const currentUserUsedStealCmd = currentUserObj.usedStealCmd;
    const targetUserGetRobbed = targetUserObj.getRobbed;

    if (currentUserDiff <= STEAL_DELAY * 60) {
        const timeToSteal = STEAL_DELAY * 60 - currentUserDiff;
        const minutes = Math.floor(timeToSteal / 60);
        const seconds = timeToSteal % 60;
        twitchClient.say(channel, "Du kannst erst in " + minutes + " Minute(n) und " + seconds + " Sekunde(n) wieder klauen.")
        return;
    }
    if (targetUserDiff <= ROB_PROTECTION * 60) {
        const timeToRob = ROB_PROTECTION * 60 - targetUserDiff;
        const minutes = Math.floor(timeToRob / 60);
        const seconds = timeToRob % 60;
        twitchClient.say(channel, targetUser + " kann erst in " + minutes + " Minute(n) und " + seconds + " Sekunde(n) wieder beklaut werden.")
        return;
    }

    currentUserObj.lastStealUse = now;
    targetUserObj.lastRobbed = now;
    currentUserObj.usedStealCmd = currentUserUsedStealCmd + 1;
    targetUserObj.getRobbed = targetUserGetRobbed + 1;

    saveData(data);

    let pointsFromTargetUser = await getPoints(targetUser);

    if (doSomethingWithProbability(0.7)) {
        if (pointsFromTargetUser == 0 || pointsFromTargetUser === undefined) {
            twitchClient.say(channel, `${targetUser} hat keine ${POINTS_NAME}, die geklaut werden können.`);
            return;
        }
        if (randomNumber >= pointsFromTargetUser) {
            twitchClient.say(channel, `${currentUser} hat ${pointsFromTargetUser} ${POINTS_NAME} von ${targetUser} geklaut.`);
            addPoints(currentUser, pointsFromTargetUser)
            removePoints(targetUser, pointsFromTargetUser)
        }
        else {
            twitchClient.say(channel, `${currentUser} hat ${randomNumber} ${POINTS_NAME} von ${targetUser} geklaut.`);
            addPoints(currentUser, randomNumber)
            removePoints(targetUser, randomNumber)
        }
    }
    else {
        let pointsFromCurrentUser = await getPoints(currentUser);
        if (pointsFromCurrentUser == 0 || pointsFromCurrentUser === undefined) {
            twitchClient.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${pointsFromCurrentUser} ${POINTS_NAME} verloren.`)
            addPoints(targetUser, pointsFromCurrentUser)
            removePoints(currentUser, pointsFromCurrentUser)
            return;
        }
        if (randomNumber >= pointsFromCurrentUser) {
            twitchClient.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${pointsFromCurrentUser} ${POINTS_NAME} verloren.`)
            addPoints(targetUser, pointsFromTargetUser)
            removePoints(currentUser, pointsFromTargetUser)
        }
        else {
            twitchClient.say(channel, `${currentUser} ist gescheitert und hat an ${targetUser} ${randomNumber} ${POINTS_NAME} verloren.`)
            addPoints(targetUser, randomNumber)
            removePoints(currentUser, randomNumber)
        }
    }
}