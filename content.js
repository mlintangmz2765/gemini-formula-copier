const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    for (let mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldInject = true;
            break;
        }
    }
    if (shouldInject) injectCopyButtons();
});

observer.observe(document.body, { childList: true, subtree: true });

function injectCopyButtons() {
    const mathElements = document.querySelectorAll('.math-block:not(.has-copy-btn), .math-inline:not(.has-copy-btn)');

    mathElements.forEach(mathEl => {
        mathEl.classList.add('has-copy-btn');

        if (window.getComputedStyle(mathEl).position === 'static') {
            mathEl.style.position = 'relative';
        }

        const btn = document.createElement('button');
        btn.className = 'gemini-math-copy-btn';
        btn.innerHTML = '📋 Copy Formula';
        btn.title = 'Copy formula to clipboard';

        if (mathEl.classList.contains('math-inline')) {
            btn.style.top = '-20px';
        }

        mathEl.appendChild(btn);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyMath(mathEl, btn);
        });
    });
}

function copyMath(mathContainer, btn) {
    const latexSource = mathContainer.getAttribute('data-math');

    if (latexSource) {
        try {
            if (typeof katex === 'undefined') {
                throw new Error("KaTeX library failed to load");
            }

            const isBlock = mathContainer.classList.contains('math-block');

            const renderedMathML = katex.renderToString(latexSource, {
                displayMode: isBlock,
                output: 'mathml'
            });

            const htmlStr = `<html xmlns:m="http://www.w3.org/1998/Math/MathML"><body><!--StartFragment-->${renderedMathML}<!--EndFragment--></body></html>`;

            const blobHtml = new Blob([htmlStr], { type: 'text/html' });
            const blobPlain = new Blob([latexSource], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobPlain
            })];

            navigator.clipboard.write(data).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copied!';
                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            }).catch(err => {
                console.error('Extension failed to write to clipboard: ', err);
                btn.innerHTML = '❌ Copy Failed';
                setTimeout(() => { btn.innerHTML = '📋 Copy Formula'; }, 2000);
            });
        } catch (e) {
            console.error('KaTeX rendering error: ', e);
            btn.innerHTML = '❌ Render Error';
            setTimeout(() => { btn.innerHTML = '📋 Copy Formula'; }, 2000);
        }
    } else {
        btn.innerHTML = '⚠️ Source not found';
        setTimeout(() => { btn.innerHTML = '📋 Copy Formula'; }, 2000);
    }
}

setTimeout(injectCopyButtons, 1500);
