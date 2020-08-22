let whitelist = ["e7de1ed5ec6d3d2d4f37d9142785ba40"];
let keyOwnerUuid = null;
let ownerIGN = null;
let apikey = null;
let initial = new Map();
let current = new Map();
let continueSession = true;

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
        })
}

function getSessionStartData() {
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
            ownerIGN = player.displayname;
            if (ownerIGN.substring(ownerIGN.length-1) == "s") {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "' livestats" + " <img src='http://cravatar.eu/helmavatar/" + keyOwnerUuid + "/24.png'>";
            } else {
                document.getElementsByTagName("H1").item(0).innerHTML = ownerIGN + "'s livestats" + " <img src='http://cravatar.eu/helmavatar/" + keyOwnerUuid + "/24.png'>";
            }
            let stats = player.stats.SkyWars;
            initial.set("wins", stats.wins);
            initial.set("losses", stats.losses);
            initial.set("kills", stats.kills);
            initial.set("deaths", stats.deaths);
            initial.set("coins", stats.coins);
            initial.set("experience", stats.skywars_experience);
            initial.set("heads", stats.heads);
            initial.set("shard", stats.shard);
        })
}

async function sessionLoop() {
    getSessionCurrentData();
    await wait(3000);
    if (continueSession){
        await sessionLoop();
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
            updateVisuals();
        })
}

function updateVisuals() {
    document.getElementById("wins").innerHTML = current.get("wins");
        document.getElementById("swins").innerHTML = "(+" + (current.get("wins")-initial.get("wins")).toString() + ")";

    document.getElementById("losses").innerHTML = current.get("losses");
        document.getElementById("slosses").innerHTML = "(+" + (current.get("losses")-initial.get("losses")).toString() + ")";

    document.getElementById("winpercentage").innerHTML = getCurrentWinPercentage() + "%";
        document.getElementById("swinpercentage").innerHTML = "(" + getSessionWinPercentage() + ")";

    document.getElementById("kills").innerHTML = current.get("kills");
        document.getElementById("skills").innerHTML = "(+" + (current.get("kills")-initial.get("kills")).toString() + ")";

    document.getElementById("deaths").innerHTML = current.get("deaths");
        document.getElementById("sdeaths").innerHTML = "(+" + (current.get("deaths")-initial.get("deaths")).toString() + ")";

    document.getElementById("kd").innerHTML = getCurrentKD().toString();
        document.getElementById("skd").innerHTML = "(" + getSessionKD() + ")";
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
    return Math.round((current.get("wins")-initial.get("wins"))/((current.get("losses")-initial.get("losses"))+(current.get("wins")-initial.get("wins")))*10000)/100;
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