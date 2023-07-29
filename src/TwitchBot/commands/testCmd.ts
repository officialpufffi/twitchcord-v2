import { AUTHORIZATION, CLIENT_ID, CLIENT_SECRET, OAUTH, twitchClient } from "../twitchBot";
import { handleIsChannelLive } from "../../Utilities/Utility";
import { ACCID, JWT_TOKEN } from "../../setup";

export function testCmd(channel, tags, message, self) {
    if (self) return;
    if (message === "!test") {
        twitchClient.say(channel, "...")
    }
    else if (message === "!test2") {
        twitchClient.say(channel, "...2");
    }
    else if (message === "!test3") {
        /*const url = 'https://api.twitch.tv/helix/streams?user_login=#stopsigncam';
        const headers = {
            'Client-ID': CLIENT_ID,
            'Authorization': 'Bearer ' + OAUTH
        };

        fetch(url, { headers })
            .then(response => response.json())
            .then(data => {
                //console.log(data)
                if (data.data.length === 0) {
                    console.log('Kanal ist offline');
                } else {
                    console.log('Kanal ist online');
                }
            })
            .catch(error => console.error(error));*/
        console.log(handleIsChannelLive("stopsigncam"))
    }
    else if (message === "!genToken" && tags.username === "official_pufffi") {
        const clientId = CLIENT_ID;
        const clientSecret = CLIENT_SECRET;
        const tokenUrl = 'https://id.twitch.tv/oauth2/token';
        const grantType = 'client_credentials';

        fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`,
        })
            .then((response) => response.json())
            .then((data) => console.log(data.access_token))
            .catch((error) => console.error(error));
    }
    else if (message === "!br2") {
        twitchClient.say(channel, "später verfügbar. bug's fixen...");
    }
    else if (message === "!test4") {
        const fetchWatchtime = async () => {
            const accessToken = JWT_TOKEN;

            const url = 'https://api.streamelements.com/kappa/v2/points/' + ACCID + '/watchtime?limit=25&offset=0';
            const options = { method: 'GET', headers: { Accept: 'application/json', Authorization: 'Bearer ' + JWT_TOKEN } };

            try {
                const response = await fetch(url, options);
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchWatchtime();
    }
}



/*async function isChannelLive(channel) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${channel}`;
    const response = await fetch(url, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': "Bearer " + AUTHORIZATION}
    });
    const data = await response.json();
    return !!data.data.length;
  }*/


async function isChannelLive(channel) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${channel}`;
    const response = await fetch(url, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': 'Bearer ' + AUTHORIZATION
        }
    });
    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
        return true;
    } else if (data && data.data && data.data.length === 0) {
        return false;
    } else {
        console.log('Fehler beim Abrufen der API-Antwort:', data);
        return false;
    }
}











/*async function isChannelLive(channelName) {
  const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': 'Bearer ' + AUTHORIZATION
    }
  });
  const data = await response.json();
  return data.data.length > 0;
}

async function handleIsChannelLive(channel) {
  try {
    let isLive = await isChannelLive(channel);
    console.log("...isChannelLive: " + isLive);
    return isLive;
  } catch (error) {
    console.error(error);
  }
}*/