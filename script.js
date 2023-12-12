let dict = {};
let hasDef = false;
let validProb = 0.5;
const DEBUG = true;
const vowels = "AEIOU";
const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
const letters = vowels + consonants;

let curWord = "";

const yesBtn = document.querySelector("#yes-btn");
const noBtn = document.querySelector("#no-btn");
yesBtn.addEventListener("click", () => select(true));
noBtn.addEventListener("click", () => select(false));

const dictConfirmBtn = document.querySelector("#dict-confirm-btn");
dictConfirmBtn.addEventListener("click", () => readDict());

const nextBtn = document.querySelector("#next-btn");
nextBtn.addEventListener("click", () => nextQuiz());

const wordDOM = document.querySelector("#word");
const judgeCorrectness = document.querySelector("#judge-correctness");
const judgeDef = document.querySelector("#judge-definition");

function select(choice) {
    valid = curWord in dict;
    correct = choice === valid;
        judgeCorrectness.textContent = (correct ? "Correct: " : "Incorrect: ")
                + curWord
                + (valid ? " is a valid word!" : " is not a valid word!");
    judgeCorrectness.style.color = (correct ? "green" : "red");
    if (DEBUG) {
        console.log("choice: " + choice);
        console.log("hasDef: " + hasDef);
        console.log("valid: " + valid);
        console.log("dict[curWord]: " + dict[curWord]);
    }
    if (hasDef && valid) {
        judgeDef.textContent = "Definition: " + dict[curWord];
    } else {
        judgeDef.textContent = "";
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
    if (lines[0].indexOf("\t") != -1) {
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
        console.log(dictSelect);
        dictSelect.style.display = "none";
    } else {
        alert("Please select a valid dictionary file.")
    }
}

/**
 * Start the next quiz.
 */
function nextQuiz() {
    console.log("Starting next quiz");
    const idx = Math.floor(Math.random() * Object.keys(dict).length);
    console.log(dict);
    const keys = Object.keys(dict);
    console.log(keys);
    const validWord = keys[idx];
    if (Math.random() > validProb) {
        // get valid word
        console.log("valid");
        console.log(validWord);
        curWord = validWord;
    } else {
        // get invalid word
        console.log("invalid");
        let invalidWord = "";
        do {
            invalidWord = getInvalidWord(validWord, mode = "random");
        } while (invalidWord in dict);
        curWord = invalidWord;
    }
    wordDOM.textContent = curWord;
}

/**
 * Generates a random capital letter from the English alphabet.
 */
function getRandomLetter() {
    return letters[Math.floor(Math.random() * letters.length)];
}

/**
 * Generate a (potentially) invalid word for the given mode
 * with the valid word as a reference.
 * @param {string} validWord 
 */
function getInvalidWord(validWord, mode) {
    switch (mode) {
        case "random":
            const len = validWord.length;
            let s = "";
            for (let i = 0; i < len; i++) {
                s += getRandomLetter();
            }
            return s;
        default:
            throw new Error("Unknown mode for generating a potential phoney!")
    }
}