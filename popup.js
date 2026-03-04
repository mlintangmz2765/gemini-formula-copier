document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="format"]');
    const options = document.querySelectorAll('.format-option');
    const latexOptions = document.getElementById('latex-options');
    const latexSelect = document.getElementById('latex-delimiter');
    let timeout;

    function saveStatus() {
        const status = document.getElementById('status');
        if (status) {
            status.classList.add('show');
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                status.classList.remove('show');
            }, 2000);
        }
    }

    // Load saved settings
    chrome.storage.sync.get({ copyFormat: 'mathml', latexDelimiter: 'none' }, (result) => {
        const format = result.copyFormat;
        const radio = document.querySelector(`input[value="${format}"]`);
        if (radio) {
            radio.checked = true;
            radio.closest('.format-option').classList.add('selected');
        }

        latexSelect.value = result.latexDelimiter;
        latexOptions.style.display = format === 'latex' ? 'flex' : 'none';
    });

    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const radio = opt.querySelector('input[type="radio"]');
            if (e.target !== radio && !e.target.closest('select')) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedFormat = e.target.value;

            options.forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.format-option').classList.add('selected');

            latexOptions.style.display = selectedFormat === 'latex' ? 'flex' : 'none';

            chrome.storage.sync.set({ copyFormat: selectedFormat }, saveStatus);
        });
    });

    latexSelect.addEventListener('change', (e) => {
        chrome.storage.sync.set({ latexDelimiter: e.target.value }, saveStatus);
    });
});
