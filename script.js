const DEBUG = true;
const vowels = "AEIOU";
const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
const letters = vowels + consonants;
let dict = {};
let hasDef = false;
let validProb = 0.5;

let true_pos = 0, true_neg = 0, false_pos = 0, false_neg = 0;
let curWord = "";

// Buttons and event listeners

const yesBtn = document.querySelector("#yes-btn");
const noBtn = document.querySelector("#no-btn");
const dictConfirmBtn = document.querySelector("#dict-confirm-btn");
const nextBtn = document.querySelector("#next-btn");
yesBtn.addEventListener("click", () => select(true));
noBtn.addEventListener("click", () => select(false));
dictConfirmBtn.addEventListener("click", () => readDict());
nextBtn.addEventListener("click", () => nextQuiz());

const wordDOM = document.querySelector("#word");
const judgeCorrectness = document.querySelector("#judge-correctness");
const judgeDef = document.querySelector("#judge-definition");

/**
 * Handles player's selection of "YES" or "NO".
 * @param {boolean} choice 
 */
function select(choice) {
    valid = curWord in dict;
    correct = choice === valid;

    if (DEBUG) {
        console.log("choice: " + choice);
        console.log("hasDef: " + hasDef);
        console.log("valid: " + valid);
        console.log("dict[curWord]: " + dict[curWord]);
    }

    // Update stats
    if (valid && choice) {
        true_pos++;
    } else if (!valid && choice) {
        false_pos++;
    } else if (valid && !choice) {
        false_neg++;
    } else if (!valid && !choice) {
        true_neg++;
    }

    // Update UI
    judgeCorrectness.textContent = (correct ? "Correct: " : "Incorrect: ")
        + curWord
        + (valid ? " is a valid word!" : " is not a valid word!");
    judgeCorrectness.style.color = (correct ? "green" : "red");
    if (hasDef && valid) {
        judgeDef.textContent = "Definition: " + dict[curWord];
        judgeDef.display = "bock";
    } else {
        judgeDef.textContent = "";
        judgeDef.display = "none";
    }
    yesBtn.disabled = true;
    noBtn.disabled = true;
    nextBtn.disabled = false;
}

/**
 * Read the dictionary file given by the user.
 */
function readDict() {
    const dictInput = document.querySelector("#dict-input");
    if ("files" in dictInput && dictInput.files.length > 0) {
        const dictFile = dictInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            dict = parseDict(reader.result.trim());
            nextQuiz();
        };
        reader.readAsText(dictFile);

        // Show quiz div, hide dict-select div
        const quiz = document.querySelector(".quiz");
        quiz.style.display = "block";
        const dictSelect = document.querySelector(".dict-select");
        dictSelect.style.display = "none";
    } else {
        alert("Please select a valid dictionary file.")
    }
}

/**
 * Parses the raw dictionary string.
 * If the dictionary contains definitions, return dictionary with (word, definition) pairs.
 * Otherwise, return dictionary with (word, "") pairs.
 * @param {string} raw the raw dictionary string
 * @return the parsed dictionary
 */
function parseDict(raw) {
    result = {};
    lines = raw.split("\n");
    if (lines[0].includes("\t")) {
        // Dictionary contains definitions
        hasDef = true;
        for (line of lines) {
            wordDef = line.split("\t");
            result[wordDef[0].trim()] = wordDef[1];
        }
    } else {
        hasDef = false;
        for (line of lines) {
            result[line.trim()] = "";
        }
    }
    if (DEBUG) {
        console.log(result);
    }
    return result;
}

/**
 * Start the next quiz.
 */
function nextQuiz() {
    if (DEBUG) {
        console.log("Starting next quiz");
    }
    const idx = Math.floor(Math.random() * Object.keys(dict).length);
    const keys = Object.keys(dict);
    const validWord = keys[idx];
    if (Math.random() > validProb) {
        // get valid word
        if (DEBUG) {
            console.log("valid");
            console.log(validWord);
        }
        curWord = validWord;
    } else {
        // get invalid word
        let invalidWord = "";
        do {
            invalidWord = getInvalidWord(validWord, mode = "random-vc");
        } while (invalidWord in dict);
        if (DEBUG) {
            console.log("invalid");
            console.log("valid word is: " + validWord);
            console.log(invalidWord);
        }
        curWord = invalidWord;
    }
    wordDOM.textContent = curWord;
    yesBtn.disabled = false;
    noBtn.disabled = false;
    nextBtn.disabled = true;
}

/**
 * Generates a random capitalized letter from the English alphabet.
 */
function getRandomLetter() {
    return letters[Math.floor(Math.random() * letters.length)];
}

/**
 * Generates a random capitalized vowel from the English alphabet.
 */
function getRandomVowel() {
    return vowels[Math.floor(Math.random() * vowels.length)];
}

/**
 * Generates a random capitalized consonant from the English alphabet.
 */
function getRandomConsonant() {
    return consonants[Math.floor(Math.random() * consonants.length)];
}

/**
 * Generate a (potentially) invalid word for the given mode
 * with the valid word as a reference.
 * Supported modes:
 * - random: Pick a random valid word, and generate a random word
 * with the same number of characters.
 * - random-vc: Pick a random valid word, and generate a random word
 * with the same number of characters; if the ith letter of the valid word
 * is a vowel, then so is the ith letter of the random word.
 * The same goes for consonants.
 * - single: Changes a single letter of the valid word to a random letter.
 * - single-vc: Changes a single letter of the valid word to a random letter,
 * where the letter is changed from a vowel to a vowel
 * or from a constant to a consonant.
 * @param {string} validWord 
 */
function getInvalidWord(validWord, mode) {
    const len = validWord.length;
    let s = "";
    let idx;
    switch (mode) {
        case "random":
            for (let i = 0; i < len; i++) {
                s += getRandomLetter();
            }
            return s;
        case "random-vc":
            for (let i = 0; i < len; i++) {
                if (vowels.includes(validWord[i])) {
                    s += getRandomVowel();
                } else {
                    s += getRandomConsonant();
                }
            }
            return s;
        case "single":
            idx = Math.floor(Math.random() * len);
            s = validWord.substring(0, idx) + getRandomLetter() + validWord.substring(idx + 1);
            return s;
        case "single-vc":
            idx = Math.floor(Math.random() * len);
            let randLetter = "";
            if (vowels.includes(validWord[idx])) {
                randLetter = getRandomVowel();
            } else {
                randLetter = getRandomConsonant();
            }
            s = validWord.substring(0, idx) + randLetter + validWord.substring(idx + 1);
            return s;
        default:
            throw new Error("Unknown mode for generating a potential phoney!")
    }
}