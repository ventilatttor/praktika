export function createCard(title, content, status) {
    if (!title.trim()) {
        throw new Error('Название карточки не может быть пустым');
    }
    
    return {
        id: Date.now().toString(),
        title: title.trim(),
        content: content ? content.trim() : '',
        status: status || 'planned'
    };
}

export function updateCard(cardId, updates, board) {
    return board.cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
    );
}

export function deleteCard(cardId, board) {
    return board.cards.filter(c => c.id !== cardId);
}