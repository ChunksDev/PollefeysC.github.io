const vowelSoundsT1 = [
    'a','e','i','o'
];
const vowelSoundsT2 = [
    'ai','au','al','ao',
    'ee','ea','ei','ey','eu','er',
    'io','ie','ia',
    'ou','ow','or','oi','oo','oa',
    'u','ue','ui','ur','ua',
    'y'
];

const consonantSoundsT1 = [
    'b','d','k','l','m','n','p','r','s','t'
];
const consonantSoundsT2 = [
    'c','f','g','h','j','v','w','x','z',
    'st','ck','sh','kn'
];

function generatePhoneticNick() {
    let word = '';
    word += buildSyllable(false);
    word += buildSyllable(isLastCharVowel(word));
    return postProcess(word);
}

function buildSyllable(lastCharVowel) {
    let syllable = '';
    //decide if we start with vowel or not
    if (coinFlip() && !lastCharVowel) {
        //vowel
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(vowelSoundsT1);
        } else {
            syllable += randomSound(vowelSoundsT2);
        }
        //consonant
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(consonantSoundsT1);
        } else {
            syllable += randomSound(consonantSoundsT2);
        }
    } else {
        //consonant
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(consonantSoundsT1);
        } else {
            syllable += randomSound(consonantSoundsT2);
        }
        //vowel
        if (heavyTrueCoinFlip()) {
            syllable += randomSound(vowelSoundsT1);
        } else {
            syllable += randomSound(vowelSoundsT2);
        }
        //coinflip for extra consonant
        if (!heavyTrueCoinFlip()) {
            //consonant
            if (heavyTrueCoinFlip()) {
                syllable += randomSound(consonantSoundsT1);
            } else {
                syllable += randomSound(consonantSoundsT2);
            }
        }
    }
    return syllable;
}

function postProcess(word) {
    //fix late oi to oy
    if (word.slice(-2) === 'oi') {
        word = replaceLast('oi', 'oy', word);
    }
    //fix late ai to ay
    if (word.slice(-2) === 'ai') {
        word = replaceLast('ai', 'ay', word);
    }
    //fix late kn
    if (word.slice(-2) === 'kn') {
        word = replaceLast('kn', 'n', word);
    }
    //fix early ck
    if (word.charAt(0) === 'c' && word.charAt(1) === 'k') {
        word = word.replace('ck','c');
    }
    //chance to give capital to start of word
    if (coinFlip()) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
        //small chance to give x or z at start
        if (!heavyTrueCoinFlip()) {
            if (word.charAt(0) !== 'X' && coinFlip()) {
                word = 'x' + word;
            } else {
                if (word.charAt(0) !== 'Z') {
                    word = 'z' + word;
                }
            }
        }
    }
    //small chance to give 1 or 2 numbers behind the name
    if (Math.random() < 0.25) {
        word = word + Math.floor(Math.random()*10);
        if (!heavyTrueCoinFlip()) {
            word = word + Math.floor(Math.random()*10);
        }
    }
    //if word is too short, add extra random syllable at end
    if (word.length < 6) {
        word += buildSyllable();
    }
    return word;
}

function isLastCharVowel(word) {
    let currently = false;
    for (let i = 0; i < vowelSoundsT1.length; i++) {
        if (word.slice(-1) === vowelSoundsT1[i]) {
            currently = true;
        }
    }
    for (let i = 0; i < vowelSoundsT2.length-1; i++) {
        if (word.slice(-2) === vowelSoundsT2[i]) {
            currently = true;
        }
    }
    if (word.slice(-1) === 'y') {
        currently = true;
    }
    return currently;
}

function coinFlip() {
    return Math.random() < 0.5;
}

function heavyTrueCoinFlip() {
    return Math.random() < 0.85;
}

function randomSound(soundsArray) {
    return soundsArray[Math.floor(Math.random()*soundsArray.length)];
}

function replaceLast(find, replace, string) {
    let lastIndex = string.lastIndexOf(find);

    if (lastIndex === -1) {
        return string;
    }

    let beginString = string.substring(0, lastIndex);
    let endString = string.substring(lastIndex + find.length);

    return beginString + replace + endString;
}
