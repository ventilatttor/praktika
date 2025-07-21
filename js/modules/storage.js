export function saveToLocalStorage(boards) {
    localStorage.setItem('taskBoards', JSON.stringify(boards));
}

export function loadFromLocalStorage() {
    const savedBoards = localStorage.getItem('taskBoards');
    return savedBoards ? JSON.parse(savedBoards) : [];
}