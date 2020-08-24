let whitelist = [
    //DEV
    //pollefeys
    "e7de1ed5ec6d3d2d4f37d9142785ba40",
    //LB
    //chqv
    "46ad38343094f4ee2ad80bd045123f16",
    //Swkills
    "5e7c9aca54bbc93e41afc804972ea7e4",
    //espenode
    "4ae43fa1ef9c94257ae8c7703eb4ea12",
    //BETA TESTER
    //virmah
    "6f687b16e475b734acedb54c51244ff2",
    //PAID
    //Vetiver (twitter)
    "392afaae0f1457dc5a22b995522a94f1",
    //JT/Squat (discord)
    "bb531d86625bfb1351b1d49102c8a80a",
    //suika (discord)
    "12babd7cfb5b0c7e2d3862fd3d67f4ec",
    //SirHingeAlot (discord)
    "8a6e3435d768bd33dd1f927afe9330b3"
];
let keyOwnerUuid = null;
let ownerIGN = null;
let apikey = null;
let initial = new Map();
let current = new Map();
let continueSession = true;
let sessionTime = 0;

let lastLoss = 0;
let winsAtLastLoss = 0;
let bestWinstreak = 0;

let lastDeath = 0;
let killsAtLastDeath = 0;
let bestKillstreak = 0;

let recentShards = 0;
let opalsGained = 0;

function runLiveStats() {
    if (isUrlKeyValid()) {
        document.getElementById("apikeyform").style.display = "none";
        apikey = getParam("key");
        initStats();
    } else {
        document.getElementById("session").style.display = "none";
    }
}

function initStats() {
    fetch("https://api.hypixel.net/key?key="+apikey)
        .then(result => result.json())
        .then(({ record }) => {
            keyOwnerUuid = record.owner;
            document.getElementsByTagName("H4").item(0).innerHTML = "You're <strong>1</strong> out of <strong>" + whitelist.length + "</strong> whitelisted players";
            getSessionStartData();
            sessionLoop();
            sessionTime = Date.now();
            sessionClock();
            sessionGa();
        })
}

function getSessionStartData() {
    getStreaks();
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
            ownerIGN = player.displayname;
            if (ownerIGN.substring(ownerIGN.length-1) == "s") {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "' livestats" + " <img src='https://cravatar.eu/helmavatar/" + keyOwnerUuid + "/24.png'>";
            } else {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "'s livestats" + " <img src='https://cravatar.eu/helmavatar/" + keyOwnerUuid + "/24.png'>";
            }
            let stats = player.stats.SkyWars;
            initial.set("wins", stats.wins);
            winsAtLastLoss = stats.wins;
            initial.set("losses", stats.losses);
            lastLoss = stats.losses;
            initial.set("kills", stats.kills);
            killsAtLastDeath = stats.kills;
            initial.set("deaths", stats.deaths);
            lastDeath = stats.deaths;
            initial.set("coins", stats.coins);
            initial.set("experience", stats.skywars_experience);
            initial.set("heads", stats.heads);
            initial.set("shard", stats.shard);
        })
}

async function sessionLoop() {
    getSessionCurrentData();
    await wait(2000);
    if (continueSession){
        await sessionLoop();
    }
}

async function sessionGa() {
    ga("send", "pageview", "");
    await wait(60000);
    if (continueSession){
        await sessionGa();
    }
}

async function sessionClock() {
    document.getElementById("sessionDuration").innerHTML = sessionDurationString(sessionDuration());
    await wait(1000);
    if (continueSession){
        await sessionClock();
    }
}

function getSessionCurrentData() {
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
            let stats = player.stats.SkyWars;
            current.set("wins", stats.wins);
            current.set("losses", stats.losses);
            current.set("kills", stats.kills);
            current.set("deaths", stats.deaths);
            current.set("coins", stats.coins);
            current.set("experience", stats.skywars_experience);
            current.set("heads", stats.heads);
            current.set("shard", stats.shard);
            checkForShardReset();
            if (current.get("losses") != lastLoss) {
                lastLoss = current.get("losses");
                winsAtLastLoss = current.get("wins");
            }
            if (current.get("deaths") != lastDeath) {
                lastDeath = current.get("deaths");
                killsAtLastDeath = current.get("kills");
            }
            updateMainSessionVisuals();
        })
}

function updateMainSessionVisuals() {
    document.getElementById("wins").innerHTML = formatNumber(current.get("wins"));
        document.getElementById("swins").innerHTML = "(+" + (current.get("wins")-initial.get("wins")).toString() + ")";

    document.getElementById("losses").innerHTML = formatNumber(current.get("losses"));
        document.getElementById("slosses").innerHTML = "(+" + (current.get("losses")-initial.get("losses")).toString() + ")";

    document.getElementById("winpercentage").innerHTML = getCurrentWinPercentage() + "%";
        document.getElementById("swinpercentage").innerHTML = "(" + getSessionWinPercentage() + ")";

    document.getElementById("kills").innerHTML = formatNumber(current.get("kills"));
        document.getElementById("skills").innerHTML = "(+" + formatNumber((current.get("kills")-initial.get("kills")).toString()) + ")";

    document.getElementById("deaths").innerHTML = formatNumber(current.get("deaths"));
        document.getElementById("sdeaths").innerHTML = "(+" + formatNumber((current.get("deaths")-initial.get("deaths")).toString()) + ")";

    document.getElementById("kd").innerHTML = getCurrentKD().toString();
        document.getElementById("skd").innerHTML = "(" + getSessionKD() + ")";

    document.getElementById("swexp").innerHTML = formatNumber(current.get("experience"));
        document.getElementById("sswexp").innerHTML = "(+" + (current.get("experience")-initial.get("experience")).toString() + ")";

    document.getElementById("coins").innerHTML = formatNumber(current.get("coins"));
        document.getElementById("scoins").innerHTML = "(+" + (current.get("coins")-initial.get("coins")).toString() + ")";

    document.getElementById("heads").innerHTML = formatNumber(current.get("heads"));
        document.getElementById("sheads").innerHTML = "(+" + (current.get("heads")-initial.get("heads")).toString() + ")";

    document.getElementById("shards").innerHTML = formatNumber(current.get("shard"));
        document.getElementById("sshards").innerHTML = "(+" + (current.get("shard")-initial.get("shard")+(opalsGained*20000)).toString() + ")";

    document.getElementById("winstreak").innerHTML = formatNumber(getWinstreak());
    document.getElementById("killstreak").innerHTML = formatNumber(getKillstreak());

    document.getElementById("bestws").innerHTML = formatNumber(bestWinstreak);
    document.getElementById("bestks").innerHTML = formatNumber(bestKillstreak);

    document.getElementById("hourlywins").innerHTML = formatNumber(Math.round(statPerHour(current.get("wins")-initial.get("wins"))));
    document.getElementById("hourlykills").innerHTML = formatNumber(Math.round(statPerHour(current.get("kills")-initial.get("kills"))));
    document.getElementById("hourlyexp").innerHTML = formatNumber(Math.round(statPerHour(current.get("experience")-initial.get("experience"))));
    document.getElementById("hourlyshards").innerHTML = formatNumber(Math.round(statPerHour(current.get("shard")-initial.get("shard")+(opalsGained*20000))));

    updateProgressBars();
    storeStreaks();
}

function checkForShardReset() {
    if (current.get("shard") < recentShards){
        opalsGained += 1;
    }
    recentShards = current.get("shard");
}

function sessionDuration() {
    return Date.now() - sessionTime;
}

function statPerHour(sessionStat) {
    return sessionStat / sessionDuration() * 1000 * 60 * 60;
}

function storeStreaks() {
    getStreaks();
    if (bestWinstreak > getCookie("winstreak")) {
        document.cookie = "winstreak=" + bestWinstreak + "; expires=Thu, 6 Dec 2035 12:00:00 UTC";
    }
    if (bestKillstreak > getCookie("killstreak")) {
        document.cookie = "killstreak=" + bestKillstreak + "; expires=Thu, 6 Dec 2035 12:00:00 UTC";
    }
}

function getStreaks() {
    if (getCookie("winstreak") != "" && getCookie("winstreak") > bestWinstreak){
        bestWinstreak = parseInt(getCookie("winstreak"));
    }
    if (getCookie("killstreak") != "" && getCookie("killstreak") > bestKillstreak){
        bestKillstreak = parseInt(getCookie("killstreak"));
    }
}

function updateProgressBars() {
    let xpbar = document.getElementById("xpbarprogress");
    let shardsbar = document.getElementById("shardsbarprogress");

    document.getElementById("xpbartext").innerHTML = "EXP — " + formatNumber(xpIntoLevel(current.get("experience"))) + "/10,000";
    xpbar.style.width = xpIntoLevel(current.get("experience"))/100 + "%";

    document.getElementById("shardsbartext").innerHTML = "Shards — " + formatNumber(current.get("shard")) + "/20,000";
    shardsbar.style.width = current.get("shard")/200 + "%";
}

//only works above level 12
function xpIntoLevel(experience) {
    return (experience - 5000)%10000;
}

function sessionDurationString(duration) {
    let ms = duration % 1000 / 100;
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

function getWinstreak() {
    if (current.get("wins")-winsAtLastLoss > bestWinstreak) {
        bestWinstreak = current.get("wins")-winsAtLastLoss;
    }
    return current.get("wins")-winsAtLastLoss;
}

function getKillstreak() {
    if (current.get("kills")-killsAtLastDeath > bestKillstreak) {
        bestKillstreak = current.get("kills")-killsAtLastDeath;
    }
    return current.get("kills")-killsAtLastDeath;
}

function getCurrentWinPercentage() {
    if (current.get("losses")+current.get("wins") == 0) {
        return "N/A";
    }
    return Math.round(current.get("wins")/(current.get("losses")+current.get("wins"))*10000)/100;
}

function getSessionWinPercentage() {
    if ((current.get("losses")-initial.get("losses"))+(current.get("wins")-initial.get("wins")) == 0) {
        return "N/A";
    }
    return Math.round((current.get("wins")-initial.get("wins"))/((current.get("losses")-initial.get("losses"))+(current.get("wins")-initial.get("wins")))*10000)/100 + "%";
}

function getCurrentKD() {
    if (current.get("deaths") == 0) {
        return "&infin;";
    }
    return Math.round(current.get("kills")/current.get("deaths")*1000)/1000;
}

function getSessionKD() {
    if (current.get("deaths")-initial.get("deaths") == 0) {
        return "&infin;";
    }
    return Math.round((current.get("kills")-initial.get("kills"))/(current.get("deaths")-initial.get("deaths"))*1000)/1000;
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function initValidation(){
    document.getElementById("apikeyform").addEventListener("submit", formValidation);
}

function isFormKeyValid() {
    let apikey = document.getElementById("key").value;
    for (let i = 0; i < whitelist.length; i++) {
        if (md5(apikey) == whitelist[i]){
            return true;
        }
    }
    return false;
}

function isUrlKeyValid() {
    let apikey = getParam("key");
    for (let i = 0; i < whitelist.length; i++) {
        if (md5(apikey) == whitelist[i]){
            return true;
        }
    }
    return false;
}

function formValidation(event) {
    if (!isFormKeyValid()){
        event.preventDefault();
        document.getElementById("invalid").innerHTML = "Your key isn't whitelisted";
    }
}

function getParam(name) {
    let queryString = decodeURIComponent(location.search.replace(/\+/g, " "));
    let regex = new RegExp(name + "=([^&*]+)");
    let result = regex.exec(queryString);
    if (result) {
        return result[1];
    }
    return null;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}