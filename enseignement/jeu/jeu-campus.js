document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map-container');

    // Charger les données à partir du CSV
    fetch('questions-campus.csv')
        .then(response => response.text())
        .then(data => {
            const labels = parseCSV(data);
            labels.forEach((label, index) => {
                addLabel(label.text, label.rectangleCoords, index);
            });
        });

    function parseCSV(data) {
        const rows = data.split('\n');
        return rows.map(row => {
            const [text, x1, y1, x2, y2] = row.split(',');
            return {
                text,
                rectangleCoords: [parseInt(x1, 10), parseInt(y1, 10), parseInt(x2, 10), parseInt(y2, 10)]
            };
        });
    }

    function addLabel(labelText, rectangleCoords, index) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = labelText;

        // Positionner initialement les étiquettes au-dessus de la carte
        label.style.left = `${20 + index * 100}px`; // Distribution horizontale
        label.style.top = `20px`; // Positionnement au-dessus de la carte

        label.draggable = true;
        label.addEventListener('dragstart', dragStart);
        label.addEventListener('dragend', function (e) {
            dragEnd(e, rectangleCoords, label);
        });

        mapContainer.appendChild(label);
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.style.opacity = '0.5';
    }

    function dragEnd(e, rectangleCoords, label) {
        e.target.style.opacity = '1';
        const x = e.pageX - mapContainer.offsetLeft;
        const y = e.pageY - mapContainer.offsetTop;

        label.style.left = `${x}px`;
        label.style.top = `${y}px`;

        // Vérification si l'étiquette est à l'intérieur du rectangle correct
        const [x1, y1, x2, y2] = rectangleCoords;
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
            label.classList.add('correct');
        } else {
            label.classList.remove('correct');
        }
    }
});