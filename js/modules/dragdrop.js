export function setupDragAndDrop(containers, onDropCallback) {
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const newStatus = e.currentTarget.dataset.status;
        onDropCallback(cardId, newStatus);
        e.currentTarget.classList.remove('drop-zone');
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drop-zone');
    }

    function handleDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drop-zone');
        }
    }

    function updateHandlers() {
        const cards = document.querySelectorAll('.card[draggable="true"]');
        
        cards.forEach(card => {
            card.removeEventListener('dragstart', handleDragStart);
            card.addEventListener('dragstart', handleDragStart);
        });

        Object.values(containers).forEach(container => {
            if (!container) return;
            
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('drop', handleDrop);
            container.removeEventListener('dragenter', handleDragEnter);
            container.removeEventListener('dragleave', handleDragLeave);
            
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
            container.addEventListener('dragenter', handleDragEnter);
            container.addEventListener('dragleave', handleDragLeave);
        });
    }

    updateHandlers();
    return updateHandlers;
}