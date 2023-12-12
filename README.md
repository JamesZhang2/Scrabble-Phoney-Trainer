# Scrabble Phoney Trainer

This project is a tool to help you memorize short valid Scrabble words. After selecting a custom dictionary file, you will be presented with a word. You need to figure out if the word is a valid word or a phoney.

The tool works best for two- and three-letter words because it's harder to generate plausible-looking phonies for longer words.

## Format for Dictionary File

To use a dictionary file with just words and no definitions, put one word on every line.

To use a dictionary file with both words and definitions, put one word and definition pair on every line, separated by a tab.

You can export a list from a Zyzzyva search using `Right click -> Save list... -> Format: One Word Per Line -> OK` and the list will be in the correct format for this application. 

## Supported Modes for Phoney Generation

The following modes for generating phonies are currently supported:

- Random: pick a random valid word, and generate a random word with the same number of characters. If the word happens to be valid, generate another one.
  - This mode should be the easiest since most random string of characters and not valid words.

## Fun Fact

The plural of `phony` is `phonies` while the plural of `phoney` is `phoneys` or `phonies`. All these words are valid words. However, `phonys` is phony!
