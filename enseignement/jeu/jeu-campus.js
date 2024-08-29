document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map');

    // Charger les données à partir du CSV
    fetch('questions-campus.csv')
        .then(response => response.text())
        .then(data => {
            const labels = parseCSV(data);
            labels.forEach(label => {
                createDraggableLabel(label.text, label.x, label.y);
            });
        });

    function parseCSV(data) {
        const rows = data.split('\n');
        return rows.map(row => {
            const [text, x, y] = row.split(',');
            return { text, x: parseInt(x, 10), y: parseInt(y, 10) };
        });
    }

    function createDraggableLabel(text, x, y) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = text;
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.draggable = true;

        label.addEventListener('dragstart', dragStart);
        label.addEventListener('dragend', dragEnd);

        mapContainer.appendChild(label);
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