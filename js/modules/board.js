export function createBoard(title, boards) {
    const newBoard = {
        id: Date.now().toString(),
        title,
        cards: []
    };
    return [...boards, newBoard];
}

export function deleteBoard(boardId, boards) {
    return boards.filter(b => b.id !== boardId);
}