const DEBUG = false;
const vowels = "AEIOU";
const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
const letters = vowels + consonants;
let dict = {};
let hasDef = false;  // whether the dictionary contains definitions
let validProb = 0.5;
let reviewProb = 0.25;
let phoneyMode = "single-vc";  // mode for generating phonies
let showSettings = false;

let truePos = 0, trueNeg = 0, falsePos = 0, falseNeg = 0;
let falsePosWords = [];
let falseNegWords = [];
let curWord = "";

const validProbBox = document.querySelector("#valid-prob");
validProbBox.value = validProb;
const reviewProbBox = document.querySelector("#review-prob");
reviewProbBox.value = reviewProb;

// Buttons and event listeners

const dictConfirmBtn = document.querySelector("#dict-confirm-btn");
const yesBtn = document.querySelector("#yes-btn");
const noBtn = document.querySelector("#no-btn");
const nextBtn = document.querySelector("#next-btn");
const settingsBtn = document.querySelector("#settings-btn");
const settingsConfirmBtn = document.querySelector("#settings-confirm-btn");
dictConfirmBtn.addEventListener("click", () => readDict());
yesBtn.addEventListener("click", () => select(true));
noBtn.addEventListener("click", () => select(false));
nextBtn.addEventListener("click", () => nextQuiz());
settingsBtn.addEventListener("click", () => toggleSettings());
settingsConfirmBtn.addEventListener("click", () => confirmSettings());

const wordDOM = document.querySelector("#word");
const judgeCorrectness = document.querySelector("#judge-correctness");
const judgeDef = document.querySelector("#judge-definition");

document.addEventListener("keydown", handleKeyDown);

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
            if (Object.keys(dict).length === 0) {
                alert("Please select a valid dictionary file.");
                return;
            }
            nextQuiz();
            // Show quiz and settings-stats div, hide dict-select div
            const quiz = document.querySelector(".quiz");
            quiz.style.display = "block";
            const settingStats = document.querySelector(".settings-stats");
            settingStats.style.display = "flex";
            const dictSelect = document.querySelector(".dict-select");
            dictSelect.style.display = "none";
        };
        reader.readAsText(dictFile);

    } else {
        alert("Please select a valid dictionary file.");
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
    for (line of lines) {
        if (line.trim() === "") {
            continue;
        }
        if (line.includes("\t")) {
            // Dictionary contains definitions
            hasDef = true;
            wordDef = line.split("\t");
            result[wordDef[0].trim().toUpperCase()] = wordDef[1];
        } else {
            result[line.trim().toUpperCase()] = "";
        }
    }
    if (DEBUG) {
        console.log(result);
    }
    return result;
}

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
        truePos++;
    } else if (!valid && choice) {
        falsePos++;
        falsePosWords.push(curWord);
    } else if (valid && !choice) {
        falseNeg++;
        falseNegWords.push(curWord);
    } else if (!valid && !choice) {
        trueNeg++;
    }

    // Update UI
    // Hide shortcut hints after first choice
    shortcutHints = document.querySelectorAll(".shortcut-hint");
    for (hint of shortcutHints) {
        hint.style.display = "none";
    }
    // Update judge
    judgeCorrectness.textContent = (correct ? "Correct: " : "Incorrect: ")
        + curWord
        + (valid ? " is a valid word!" : " is not a valid word!");
    judgeCorrectness.style.color = (correct ? "green" : "red");
    if (hasDef && valid) {
        judgeDef.textContent = "Definition: " + dict[curWord];
        judgeDef.style.display = "block";
    } else {
        judgeDef.textContent = "";
        judgeDef.style.display = "none";
    }
    updateStatsUI();
    // Toggle buttons
    yesBtn.disabled = true;
    noBtn.disabled = true;
    nextBtn.disabled = false;
}

/**
 * Update the stats table to display the current stats
 */
function updateStatsUI() {
    const truePosCell = document.querySelector("#true-pos");
    const trueNegCell = document.querySelector("#true-neg");
    const falsePosCell = document.querySelector("#false-pos");
    const falseNegCell = document.querySelector("#false-neg");
    const totalCorrectCell = document.querySelector("#total-correct");
    const totalIncorrectCell = document.querySelector("#total-incorrect");
    truePosCell.textContent = truePos;
    trueNegCell.textContent = trueNeg;
    falsePosCell.textContent = falsePos;
    falseNegCell.textContent = falseNeg;
    let total = truePos + trueNeg + falsePos + falseNeg;
    let correct = truePos + trueNeg;
    let incorrect = falsePos + falseNeg;
    totalCorrectCell.textContent = correct + " (" + Math.round(correct / total * 100) + "%)";
    totalIncorrectCell.textContent = incorrect + " (" + Math.round(incorrect / total * 100) + "%)";

}

/**
 * Start the next quiz.
 * Generates a valid word with probability validProb.
 * Reviews a word with probability reviewProb if the corresponding
 * (invalid: false positive, valid: false negative) list is nonempty,
 * and the word is drawn with probability proportional to the number
 * of times it is answered incorrectly. 
 */
function nextQuiz() {
    if (DEBUG) {
        console.log("Starting next quiz");
    }
    const idx = Math.floor(Math.random() * Object.keys(dict).length);
    const keys = Object.keys(dict);
    let validWord = keys[idx];
    if (Math.random() < validProb) {
        // get valid word
        if (Math.random() < reviewProb && falseNeg > 0) {
            if (DEBUG) {
                console.log("Review valid word");
            }
            validWord = falseNegWords[Math.floor(Math.random() * falseNeg)]
        }
        if (DEBUG) {
            console.log("valid: " + validWord);
        }
        curWord = validWord;
    } else {
        // get invalid word
        let invalidWord = "";
        if (Math.random() < reviewProb && falsePos > 0) {
            if (DEBUG) {
                console.log("Review invalid word");
            }
            invalidWord = falsePosWords[Math.floor(Math.random() * falsePos)]
        } else {
            do {
                invalidWord = getInvalidWord(validWord);
            } while (invalidWord in dict);
        }
        if (DEBUG) {
            console.log("invalid: " + invalidWord);
            console.log("valid word is: " + validWord);
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
 * Generate a potentially invalid word for the given mode
 * with the valid word as a reference.
 * 
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
 * 
 * @param {string} validWord 
 */
function getInvalidWord(validWord) {
    const len = validWord.length;
    let s = "";
    let idx;
    switch (phoneyMode) {
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

/**
 * Toggles showing or hiding the settings menu. 
 */
function toggleSettings() {
    const settingsMenu = document.querySelector("#settings-menu");
    if (showSettings) {
        showSettings = false;
        settingsBtn.textContent = "Show Settings";
        settingsMenu.style.display = "none";
    } else {
        showSettings = true;
        settingsBtn.textContent = "Hide Settings";
        settingsMenu.style.display = "block";
    }
}

/**
 * Handles key presses (shortcuts for selecting yes/no and going to the next question)
 * @param {*} event 
 */
function handleKeyDown(event) {
    const quiz = document.querySelector(".quiz");
    if (quiz.style.display !== "none") {
        if (event.code === "ArrowLeft" && !yesBtn.disabled) {
            select(true);
        } else if (event.code === "ArrowRight" && !noBtn.disabled) {
            select(false);
        } else if ((event.code === "ArrowDown" || event.code === "Space") && !nextBtn.disabled) {
            event.preventDefault()  // Prevents scrolling down
            nextQuiz();
        }
    }
}

function confirmSettings() {
    const validProbInput = document.querySelector("#valid-prob").value;
    const reviewProbInput = document.querySelector("#review-prob").value;
    const phoneyModeInput = document.querySelector(".phoney-mode-fieldset input[type='radio']:checked").value;
    if (DEBUG) {
        console.log(`validProbInput: ${validProbInput}`);
        console.log(`reviewProbInput: ${reviewProbInput}`);
        console.log(`phoneyModeInput: ${phoneyModeInput}`);
    }
    
    // Validation
    if (validProbInput < 0 || validProbInput > 1) {
        alert("Please enter a value between 0 and 1 for probability of valid word.");
        // Reset to previous valid value
        validProbBox.value = validProb;
        reviewProbBox.value = reviewProb;
        return;
    }
    if (reviewProbInput < 0 || reviewProbInput > 1) {
        alert("Please enter a value between 0 and 1 for probability of review.");
        // Reset to previous valid value
        validProbBox.value = validProb;
        reviewProbBox.value = reviewProb;
        return;
    }
    
    validProb = validProbInput;
    reviewProb = reviewProbInput;
    phoneyMode = phoneyModeInput;
}