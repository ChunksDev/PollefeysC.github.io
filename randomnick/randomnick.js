//methods of nick gen
let nick;
switch (Math.floor(Math.random())) {
    //random phonetically viable letters
    case 0:
        nick = generatePhoneticNick();
        changeNick(nick);
}

function changeNick(generatedNick) {
    document.getElementById("nick").innerHTML = generatedNick;
}