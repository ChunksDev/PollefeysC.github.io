let whitelist = ["e7de1ed5ec6d3d2d4f37d9142785ba40"];
let keyOwnerUuid = null;
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
            getSessionStartData();
            sessionLoop();
        })
}

function getSessionStartData() {
    fetch("https://api.hypixel.net/player?uuid="+keyOwnerUuid+"&key="+apikey)
        .then(result => result.json())
        .then(({ player }) => {
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
    updateVisuals();
    await wait(5000);
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
        })
}

function updateVisuals() {

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