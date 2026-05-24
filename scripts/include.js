function includeHTML() {
    const baseUrl = window.location.href;  // Use the current document's URL as the base

    document.querySelectorAll('[data-include]').forEach(el => {
        let file = el.getAttribute('data-include');
        let filePath = new URL(file, baseUrl).href;  // Construct an absolute path

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                el.innerHTML = data;
                normalizeLocalBaseLinks(el);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });
}

function normalizeLocalBaseLinks(root) {
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (!isLocal || window.location.pathname.startsWith('/gouez_f/')) {
        return;
    }

    root.querySelectorAll('[href^="/gouez_f/"], [src^="/gouez_f/"]').forEach(el => {
        ['href', 'src'].forEach(attr => {
            const value = el.getAttribute(attr);
            if (value && value.startsWith('/gouez_f/')) {
                el.setAttribute(attr, value.replace('/gouez_f/', '/'));
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', includeHTML);
