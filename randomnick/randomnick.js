//methods of nick gen
function generateNick() {
    let nick;
    switch (Math.floor(Math.random())) {
        //random phonetically viable letters
        case 0:
            nick = generatePhoneticNick();
            addNick(nick);
    }
}

function addNick(generatedNick) {
    let node = document.createElement("H1");
    let textnode = document.createTextNode(generatedNick);
    node.appendChild(textnode);
    document.getElementsByTagName("body").item(0).appendChild(node);
}