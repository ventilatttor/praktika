import { saveToLocalStorage, loadFromLocalStorage } from './modules/storage.js';
import { createBoard, deleteBoard } from './modules/board.js';
import { createCard, updateCard, deleteCard } from './modules/card.js';
import { renderCards, renderBoardsList, setupUIEventListeners, showConfirmModal } from './modules/ui.js';
import { setupDragAndDrop } from './modules/dragdrop.js';

let boards = [];
let currentBoard = null;
let currentCard = null;

document.addEventListener('DOMContentLoaded', () => {
    boards = loadFromLocalStorage();
    if (boards.length > 0) {
        currentBoard = boards[0];
    }

    const containers = {
        planned: document.getElementById('planned-cards'),
        'in-progress': document.getElementById('in-progress-cards'),
        done: document.getElementById('done-cards')
    };

    setupUIEventListeners({
        onBoardCreate: handleBoardCreate,
        onBoardDelete: handleBoardDelete,
        onCardSave: handleCardSave,
        onCardDelete: handleCardDelete,
        onAddCardClick: showAddCardModal,
        onShowBoardsList: showBoardsList
    });

    const updateDragHandlers = setupDragAndDrop(containers, (cardId, newStatus) => {
        if (!currentBoard) return;
        
        currentBoard.cards = updateCard(
            cardId,
            { status: newStatus },
            currentBoard
        );
        
        saveToLocalStorage(boards);
        renderCards(currentBoard.cards, containers);
        updateDragHandlers();
    });

    updateBoardView();
    renderBoardsList(boards, currentBoard?.id);

    document.addEventListener('boardSelected', (e) => {
        currentBoard = boards.find(b => b.id === e.detail);
        updateBoardView();
    });

    document.addEventListener('cardSelected', (e) => {
        if (!currentBoard) return;
        
        const card = currentBoard.cards.find(c => c.id === e.detail);
        if (card) {
            currentCard = card;
            showCardModal(card);
        }
    });

    async function handleBoardCreate(title) {
        if (!title.trim()) return;
        
        boards = createBoard(title, boards);
        currentBoard = boards[boards.length - 1];
        saveToLocalStorage(boards);
        updateBoardView();
        renderBoardsList(boards, currentBoard.id);
    }

    async function handleBoardDelete() {
        if (!currentBoard) return;
        
        const isConfirmed = await showConfirmModal(
            'Удаление доски',
            `Вы уверены, что хотите удалить доску "${currentBoard.title}"?`
        );
        
        if (isConfirmed) {
            boards = deleteBoard(currentBoard.id, boards);
            currentBoard = boards.length > 0 ? boards[0] : null;
            saveToLocalStorage(boards);
            updateBoardView();
            renderBoardsList(boards, currentBoard?.id);
        }
    }

    async function handleCardSave(cardData) {
        if (!currentBoard) return;
        
        if (cardData.id) {
            currentBoard.cards = updateCard(
                cardData.id,
                cardData,
                currentBoard
            );
        } else {
            const newCard = createCard(
                cardData.title,
                cardData.content,
                cardData.status
            );
            currentBoard.cards.push(newCard);
        }
        
        saveToLocalStorage(boards);
        renderCards(currentBoard.cards, containers);
        updateDragHandlers();
    }

    async function handleCardDelete(cardId) {
        if (!currentBoard || !cardId) return;
        
        const isConfirmed = await showConfirmModal(
            'Удаление карточки',
            'Вы уверены, что хотите удалить эту карточку?'
        );
        
        if (isConfirmed) {
            currentBoard.cards = deleteCard(cardId, currentBoard);
            saveToLocalStorage(boards);
            renderCards(currentBoard.cards, containers);
            document.getElementById('card-modal').style.display = 'none';
            updateDragHandlers();
        }
    }

    function showAddCardModal() {
        currentCard = null;
        showCardModal({
            id: '',
            title: '',
            content: '',
            status: 'planned'
        });
    }

    function showCardModal(card) {
        document.getElementById('card-id-input').value = card.id;
        document.getElementById('card-title-input').value = card.title;
        document.getElementById('card-content-input').value = card.content || '';
        document.getElementById('card-status-input').value = card.status;
        document.getElementById('delete-card-btn').classList.toggle('hidden', !card.id);
        document.getElementById('card-modal').style.display = 'flex';
    }

    function showBoardsList() {
        renderBoardsList(boards, currentBoard?.id);
        document.getElementById('boards-modal').style.display = 'flex';
    }

    function updateBoardView() {
        const boardTitleElement = document.getElementById('board-title');
        const addCardBtn = document.getElementById('add-card-btn');
        const deleteBoardBtn = document.getElementById('delete-board-btn');
        
        if (currentBoard) {
            boardTitleElement.textContent = currentBoard.title;
            addCardBtn.classList.remove('hidden');
            deleteBoardBtn.classList.remove('hidden');
            renderCards(currentBoard.cards, containers);
            updateDragHandlers();
        } else {
            boardTitleElement.textContent = 'Выберите доску';
            addCardBtn.classList.add('hidden');
            deleteBoardBtn.classList.add('hidden');
            Object.values(containers).forEach(c => c.innerHTML = '');
        }
    }
});