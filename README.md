# MathBridge - AI Formula Copier

[![Version](https://img.shields.io/badge/version-1.0.0--stable-0b9d58.svg)](https://github.com/mlintangmz2765/MathBridge)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/mlintangmz)

MathBridge is a lightweight browser extension designed to bridge the gap between AI platforms and your workflow. It enables seamless extraction and conversion of TeX-based formulas into Microsoft Word (MathML), LaTeX, high-fidelity Plain Text (Unicode), or transparent PNG images.

## Key Features

- **Automated TeX Extraction**: Detects and extracts raw LaTeX source from Gemini, ChatGPT, DeepSeek, Claude, and Perplexity.
- **Office Math Object Injection**: Converts formulas into MathML wrappers supported by Microsoft Word for native equation editing.
- **Unicode Math Mapping**: Implements a recursive MathML walker to generate high-fidelity plain text for non-TeX environments (e.g., Notepad, messaging apps).
- **High-Resolution Rendering**: Provides PNG export with transparency, utilizing a sanitized headless rendering process to ensure visual consistency across different web themes.
- **Zero-Config Integration**: Injects unobtrusive copy triggers directly into the AI's rendering layer.

## Installation

### Manual Loading (Developer Mode)
1. Clone the repository:
   ```bash
   git clone https://github.com/mlintangmz2765/MathBridge.git
   ```
2. Navigate to `chrome://extensions/` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and point to the project directory.

## Technical Implementation

MathBridge operates by intercepting the DOM after KaTeX/MathJax rendering. It retrieves the underlying TeX source and uses an internal KaTeX instance to generate a presentation MathML tree. For plain text conversion, it performs a recursive depth-first traversal of the node tree, mapping MathML tags and attributes to corresponding Mathematical Alphanumeric Symbols in Unicode.

## Requirements

- Google Chrome (or Chromium-based browser)
- Microsoft Word (for MathML/Equation support)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Community & Support

- **Privacy Policy**: Read our [Privacy Policy](PRIVACY.md) to understand how we protect your data (we work 100% locally).
- **Contributing**: We welcome pull requests! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

If you find this extension helpful, consider supporting the development:
<div style="display: flex; gap: 10px;">
  <a href="https://trakteer.id/mlintangmz" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png" height="40" style="border:0px;height:40px;" alt="Dukung Saya di Trakteer"></a>
  <a href="https://www.buymeacoffee.com/mlintangmz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 144px !important;" ></a>
</div>

---
*Developed by mlintangmz | 2026*
