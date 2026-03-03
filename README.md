# Gemini Formula Copier for MS Word

A simple, lightweight Google Chrome extension that allows you to easily copy mathematical formulas and equations from Google Gemini and paste them directly into Microsoft Word without losing their structure or formatting.

## Features

- **Seamless MS Word Integration**: Pastes equations as native, editable Word Equations (Office Math objects).
- **One-Click Copy**: Injects a handy "Copy Formula" button directly onto Gemini's math blocks.
- **Under-the-Hood Conversion**: Automatically translates Gemini's raw LaTeX source into presentation-ready MathML in the background using KaTeX.
- **Zero Configuration**: Just install and go. No settings to tweak.

## Installation

### For Users (Manual Installation)
1. Download or clone this repository to your local machine:
   ```bash
   git clone https://github.com/mlintangmz2765/gemini-formula-copier.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click the **Load unpacked** button.
5. Select the `gemini-formula-copier` folder you just downloaded.
6. Refresh any open Gemini tabs for the extension to take effect.

## Usage

1. Go to [Google Gemini](https://gemini.google.com/) and ask it to generate a mathematical formula.
2. Hover your mouse over the formula block.
3. A small **📋 Copy Formula** button will appear in the top right corner of the formula.
4. Click the button (it will momentarily change to "✅ Copied!").
5. Open **Microsoft Word**.
6. Paste (`Ctrl + V` or `Cmd + V`). The formula will instantly appear as a fully editable Native Word Equation.

*Note: Google Docs explicitly strips MathML data from the clipboard, so pasting there will result in the raw LaTeX code being inserted instead of a rendered equation.*

## How It Works

Gemini renders math visually using KaTeX HTML spans but does not inject standard `MathML` into the DOM. However, it does store the raw LaTeX source in a `data-math` attribute. 

This extension works by reading that `data-math` attribute, utilizing a bundled `katex.min.js` to render true `<math>` presentation elements on the fly, and writing that MathML within a specialized HTML wrapper straight to your system clipboard (`<!--StartFragment-->...<!--EndFragment-->`). This is the exact format MS Word looks for when parsing equations from HTML clipboards.

## License

This project is open-source and available under the [MIT License](LICENSE).
