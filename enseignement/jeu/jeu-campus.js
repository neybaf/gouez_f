document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map-container');

    // Charger les données à partir du CSV
    fetch('questions-campus.csv')
        .then(response => response.text())
        .then(data => {
            const labels = parseCSV(data);
            labels.forEach(label => {
                addMultipleLabelsToRectangle(label.text, label.coordinates);
            });
        });

    function parseCSV(data) {
        const rows = data.split('\n');
        return rows.map(row => {
            const [text, x1, y1, x2, y2] = row.split(',');
            return {
                text,
                coordinates: [parseInt(x1, 10), parseInt(y1, 10), parseInt(x2, 10), parseInt(y2, 10)]
            };
        });
    }

    function addMultipleLabelsToRectangle(labelText, coords) {
        const [x1, y1, x2, y2] = coords;

        // Calculer la largeur et la hauteur du rectangle
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        // Créer et positionner l'étiquette au centre du rectangle
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = labelText;

        const centerX = x1 + width / 2;
        const centerY = y1 + height / 2;

        label.style.left = `${centerX}px`;
        label.style.top = `${centerY}px`;

        // Ajouter l'étiquette à la carte
        mapContainer.appendChild(label);

        // Ajouter la fonctionnalité de drag-and-drop
        label.draggable = true;
        label.addEventListener('dragstart', dragStart);
        label.addEventListener('dragend', dragEnd);
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.style.opacity = '0.5';
    }

    function dragEnd(e) {
        e.target.style.opacity = '1';
        const x = e.pageX - mapContainer.offsetLeft;
        const y = e.pageY - mapContainer.offsetTop;
        e.target.style.left = `${x}px`;
        e.target.style.top = `${y}px`;
    }
});