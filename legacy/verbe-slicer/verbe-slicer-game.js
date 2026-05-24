(function () {
    const activeBase = '../../enseignement/jeu/verbe-slicer/';
    const activeData = activeBase + 'jeu-verbes.json';
    const originalFetch = window.fetch.bind(window);

    window.fetch = function (resource, init) {
        const url = typeof resource === 'string' ? resource : resource && resource.url;
        if (url === 'jeu-verbes.json' || url === './jeu-verbes.json') {
            return originalFetch(activeData, init);
        }
        return originalFetch(resource, init);
    };

    const script = document.createElement('script');
    script.src = activeBase + 'verbe-slicer-game.js';
    document.currentScript.after(script);
})();
