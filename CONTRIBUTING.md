# Contributing to MathBridge

First off, thank you for considering contributing to MathBridge. It's people like you that make MathBridge such a great tool.

## Where do I go from here?

If you've noticed a bug or have a question, [search the issue tracker](https://github.com/mlintangmz2765/MathBridge/issues) to see if someone else in the community has already created a ticket. If not, go ahead and make one!

## Fork & Pull Request Workflow

1. **Fork** the repo on GitHub.
2. **Clone** the project to your own machine.
3. **Commit** changes to your own branch.
4. **Push** your work back up to your fork.
5. Submit a **Pull Request** so that we can review your changes.

NOTE: Be sure to merge the latest from "upstream" before making a pull request!

## Chrome Web Store Guidelines (Manifest V3)
Please ensure any modifications comply with Chrome's Manifest V3 constraints:
- Do not introduce remote hosted code (e.g., `<script src="https://...">`). Use localized, static assets instead.
- Minimize permission requests in `manifest.json`.
- Keep the `content.js` lean and performant.

Thank you!
