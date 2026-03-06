function mathMLToPlainText(source) {
    try {
        const mathml = katex.renderToString(source, { output: 'mathml' });
        const parser = new DOMParser();
        const doc = parser.parseFromString(mathml, 'text/html');
        const root = doc.querySelector('math');
        if (!root) return source;

        function toMathChar(ch, variant) {
            const c = ch.codePointAt(0);
            if (variant === 'bold') {
                if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D400 + c - 65);
                if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D41A + c - 97);
            } else if (variant === 'italic') {
                if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D434 + c - 65);
                if (c >= 97 && c <= 122) return c === 104 ? '\u210E' : String.fromCodePoint(0x1D44E + c - 97);
            } else if (variant === 'bold-italic') {
                if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D468 + c - 65);
                if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D482 + c - 97);
            }
            return ch;
        }

        const subMap = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ' };
        const supMap = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ' };

        function walk(node, variant = 'normal') {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent.trim();
                return text.split('').map(c => toMathChar(c, variant)).join('');
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return '';

            let localVariant = variant;
            const mathvariant = node.getAttribute('mathvariant');
            if (mathvariant === 'bold') localVariant = 'bold';
            else if (mathvariant === 'italic') localVariant = 'italic';
            else if (mathvariant === 'bold-italic') localVariant = 'bold-italic';

            const tag = node.tagName.toLowerCase();
            if (tag === 'annotation') return '';

            const children = Array.from(node.childNodes);
            if (tag === 'mfrac') {
                return `(${walk(children[0], localVariant)})/(${walk(children[1], localVariant)})`;
            } else if (tag === 'msub') {
                const base = walk(children[0], localVariant);
                const sub = walk(children[1], localVariant).split('').map(c => subMap[c] || c).join('');
                return base + sub;
            } else if (tag === 'msup') {
                const base = walk(children[0], localVariant);
                const sup = walk(children[1], localVariant).split('').map(c => supMap[c] || c).join('');
                return base + sup;
            } else if (tag === 'msubsup') {
                const base = walk(children[0], localVariant);
                const sub = walk(children[1], localVariant).split('').map(c => subMap[c] || c).join('');
                const sup = walk(children[2], localVariant).split('').map(c => supMap[c] || c).join('');
                return base + sub + sup;
            } else if (tag === 'mover' || tag === 'munder') {
                return walk(children[0], localVariant);
            } else if (tag === 'mfenced') {
                const open = node.getAttribute('open') || '(';
                const close = node.getAttribute('close') || ')';
                return open + children.map(c => walk(c, localVariant)).join('') + close;
            } else if (tag === 'mo') {
                let text = node.textContent.trim();
                return ` ${text} `;
            }

            return children.map(c => walk(c, localVariant)).join('');
        }

        return walk(root).replace(/\s+/g, ' ').trim();
    } catch (e) { return source; }
}

function copyUnicode(mathEl, source, btn) {
    try {
        const text = mathMLToPlainText(source);
        writePlain(text, btn);
    } catch (e) { writePlain(source, btn); }
}

const extractKaTeX = (el) => {
    const dataMath = el.getAttribute('data-math');
    if (dataMath) return dataMath;
    const anno = el.querySelector('annotation[encoding="application/x-tex"]');
    if (anno) return anno.textContent.trim();
    return null;
};

const MATH_SELECTORS = [
    '.math-block:not(.has-copy-btn)',
    '.math-inline:not(.has-copy-btn)',
    '.katex-display:not(.has-copy-btn)',
    '.katex:not(.has-copy-btn)',
    '[data-math]:not(.has-copy-btn)'
].join(', ');

const CONFIG = {
    'gemini.google.com': { selector: MATH_SELECTORS, extract: extractKaTeX },
    'chat.deepseek.com': { selector: MATH_SELECTORS, extract: extractKaTeX },
    'perplexity.ai': { selector: MATH_SELECTORS + ', .mjx-container, [data-testid="message-content"] math', extract: extractKaTeX },
    'chatgpt.com': { selector: MATH_SELECTORS, extract: extractKaTeX },
    'claude.ai': { selector: MATH_SELECTORS, extract: extractKaTeX }
};

function getConfig() {
    const host = window.location.hostname;
    const match = Object.keys(CONFIG).find(key => host === key || host.endsWith('.' + key));
    return CONFIG[match] || CONFIG['gemini.google.com'];
}

const observer = new MutationObserver((mutations) => {
    let changed = false;
    for (let mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            changed = true;
            break;
        }
    }
    if (changed) inject();
});

const isExtensionValid = () => {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
};

observer.observe(document.body, { childList: true, subtree: true });

function inject() {
    const settings = getConfig();
    const elements = document.querySelectorAll(settings.selector);

    elements.forEach(mathEl => {
        if (mathEl.closest('.has-copy-btn')) return;
        mathEl.classList.add('has-copy-btn');
        if (window.getComputedStyle(mathEl).position === 'static') {
            mathEl.style.position = 'relative';
        }

        const btn = document.createElement('button');
        btn.className = 'formula-copy-btn';
        btn.textContent = 'Click to copy';
        btn.style.pointerEvents = 'none';
        mathEl.appendChild(btn);

        mathEl.addEventListener('click', (e) => {
            e.preventDefault();
            const source = settings.extract(mathEl);
            if (!source) { showFeedback(btn, 'No source found', 'error'); return; }

            const isBlock = mathEl.classList.contains('math-block') || mathEl.classList.contains('katex-display');

            const defaultOpts = { copyFormat: 'mathml', latexDelimiter: 'none' };

            if (!isExtensionValid() || !chrome.storage || !chrome.storage.sync) {
                // Fallback to defaults if extension context is lost or storage unavailable
                copyMathML(source, isBlock, btn);
                return;
            }

            chrome.storage.sync.get(defaultOpts, (result) => {
                if (chrome.runtime.lastError) {
                    copyMathML(source, isBlock, btn);
                    return;
                }
                const format = result.copyFormat;
                const delimiter = result.latexDelimiter;

                if (format === 'mathml') copyMathML(source, isBlock, btn);
                else if (format === 'plain') copyUnicode(mathEl, source, btn);
                else if (format === 'latex') copyRaw(source, isBlock, delimiter, btn);
                else if (format === 'image') copyImage(source, isBlock, btn);
            });
        });
    });
}

function copyMathML(source, isBlock, btn) {
    try {
        let rendered = katex.renderToString(source, { displayMode: isBlock, output: 'mathml' }).trim();

        rendered = rendered.replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/gi, '');

        const html = `<html xmlns:m="http://www.w3.org/1998/Math/MathML"><body><!--StartFragment-->${rendered}<!--EndFragment--></body></html>`;
        writeToClipboard({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([source], { type: 'text/plain' }) }, btn);
    } catch (e) { showFeedback(btn, 'Error', 'error'); }
}

function copyRaw(source, isBlock, delimiter, btn) {
    let output = source;
    if (delimiter === 'dollar') {
        output = isBlock ? `$$\n${source}\n$$` : `$${source}$`;
    } else if (delimiter === 'bracket') {
        output = isBlock ? `\\[\n${source}\n\\]` : `\\(${source}\\)`;
    }
    writePlain(output, btn);
}

async function copyImage(source, isBlock, btn) {
    try {
        const temp = document.createElement('div');
        temp.style.cssText = 'position:fixed;left:0;top:0;z-index:-1;padding:20px;color:black !important;fill:black !important;';
        document.body.appendChild(temp);
        katex.render(source, temp, { displayMode: isBlock, output: 'html', throwOnError: false });

        const htmlPart = temp.querySelector('.katex-html');
        if (!htmlPart) { temp.remove(); return showFeedback(btn, 'Error', 'error'); }

        await document.fonts.ready;

        const baseRect = htmlPart.getBoundingClientRect();
        const scale = 3;
        const pad = 20;
        const w = Math.ceil(baseRect.width) + pad * 2;
        const h = Math.ceil(baseRect.height) + pad * 2;

        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        const svgTasks = [];

        function drawNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (!text.trim()) return;
                const parent = node.parentElement;
                const cs = window.getComputedStyle(parent);
                if (cs.display === 'none' || cs.visibility === 'hidden') return;
                const range = document.createRange();
                range.selectNodeContents(node);
                const rects = range.getClientRects();
                ctx.save();
                ctx.font = cs.font;
                ctx.fillStyle = (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') ? cs.color : '#000';
                ctx.textBaseline = 'alphabetic';
                for (const r of rects) {
                    ctx.fillText(text, r.left - baseRect.left + pad, r.bottom - baseRect.top + pad);
                }
                ctx.restore();
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const cs = window.getComputedStyle(node);
            if (cs.display === 'none') return;
            const nr = node.getBoundingClientRect();

            ['Top', 'Bottom'].forEach(side => {
                const bw = parseFloat(cs['border' + side + 'Width']);
                if (bw > 0.3 && cs['border' + side + 'Style'] !== 'none') {
                    ctx.fillStyle = cs['border' + side + 'Color'] || '#000';
                    const x = nr.left - baseRect.left + pad;
                    const yBase = nr.top - baseRect.top + pad;
                    if (side === 'Bottom') ctx.fillRect(x, yBase + nr.height - bw, nr.width, bw);
                    else ctx.fillRect(x, yBase, nr.width, bw);
                }
            });

            if (node.tagName && node.tagName.toLowerCase() === 'svg') {
                const svgClone = node.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                const xml = new XMLSerializer().serializeToString(svgClone);
                const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                svgTasks.push(new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, nr.left - baseRect.left + pad, nr.top - baseRect.top + pad, nr.width, nr.height);
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
                    img.src = url;
                }));
                return;
            }

            for (const child of node.childNodes) drawNode(child);
        }

        drawNode(htmlPart);
        await Promise.all(svgTasks);

        canvas.toBlob(blob => {
            if (blob) writeToClipboard({ 'image/png': blob }, btn);
            else showFeedback(btn, 'Error', 'error');
        }, 'image/png');
        temp.remove();
    } catch (e) { showFeedback(btn, 'Error', 'error'); }
}

function writePlain(text, btn) {
    navigator.clipboard.writeText(text).then(() => showFeedback(btn, 'Copied!', 'copied'))
        .catch(() => showFeedback(btn, 'Failed', 'error'));
}

function writeToClipboard(items, btn) {
    navigator.clipboard.write([new ClipboardItem(items)]).then(() => showFeedback(btn, 'Copied!', 'copied'))
        .catch(() => showFeedback(btn, 'Failed', 'error'));
}

function showFeedback(btn, text, className) {
    const originalText = btn.textContent;
    btn.textContent = text;
    btn.classList.add(className);
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove(className);
    }, 2000);
}

setTimeout(inject, 1500);
