document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.querySelector('.dropdown-content');
    const allBoardsBtn = document.getElementById('all-boards-btn');
    const createBoardBtn = document.getElementById('create-board-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const boardModal = document.getElementById('board-modal');
    const boardForm = document.getElementById('board-form');
    const boardTitleInput = document.getElementById('board-title-input');
    const cancelBoardBtn = document.getElementById('cancel-board-btn');
    const boardTitleElement = document.getElementById('board-title');
    const deleteBoardBtn = document.getElementById('delete-board-btn');
    const addCardBtn = document.getElementById('add-card-btn');
    const cardsContainer = document.getElementById('cards-container');
    const cardModal = document.getElementById('card-modal');
    const cardForm = document.getElementById('card-form');
    const cardIdInput = document.getElementById('card-id-input');
    const cardTitleInput = document.getElementById('card-title-input');
    const cardContentInput = document.getElementById('card-content-input');
    const saveCardBtn = document.getElementById('save-card-btn');
    const cancelCardBtn = document.getElementById('cancel-card-btn');
    const deleteCardBtn = document.getElementById('delete-card-btn');
    const boardsModal = document.getElementById('boards-modal');
    const boardsList = document.getElementById('boards-list');
    const closeBoardsBtn = document.getElementById('close-boards-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    // Данные приложения
    let boards = [];
    let currentBoard = null;
    let currentCard = null;
    let confirmResolve = null;

    // Инициализация
    init();

    function init() {
        setupEventListeners();
        loadFromLocalStorage();
    }

    function setupEventListeners() {
        // Меню
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', hideMenu);

        // Кнопки меню
        allBoardsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showAllBoardsModal();
        });
        
        createBoardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showBoardModal();
        });
        
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSettings();
        });
        
        // Доски
        boardForm.addEventListener('submit', handleBoardCreate);
        cancelBoardBtn.addEventListener('click', hideBoardModal);
        
        // Карточки
        addCardBtn.addEventListener('click', showAddCardModal);
        cardForm.addEventListener('submit', handleCardSave);
        cancelCardBtn.addEventListener('click', hideCardModal);
        deleteCardBtn.addEventListener('click', handleCardDelete);
        deleteBoardBtn.addEventListener('click', handleBoardDelete);
        
        // Список досок
        closeBoardsBtn.addEventListener('click', hideAllBoardsModal);
        
        // Подтверждение действий
        confirmYes.addEventListener('click', () => handleConfirmResponse(true));
        confirmNo.addEventListener('click', () => handleConfirmResponse(false));
    }

    function toggleMenu() {
        menuDropdown.classList.toggle('hidden');
    }

    function hideMenu() {
        menuDropdown.classList.add('hidden');
    }

    function showBoardModal() {
        hideMenu();
        boardModal.style.display = 'flex';
        boardTitleInput.focus();
    }

    function hideBoardModal() {
        boardModal.style.display = 'none';
        boardTitleInput.value = '';
    }

    function showAddCardModal() {
        currentCard = null;
        cardForm.reset();
        cardIdInput.value = '';
        showCardModal();
    }

    function showCardModal() {
        cardModal.style.display = 'flex';
        cardTitleInput.focus();
    }

    function hideCardModal() {
        cardModal.style.display = 'none';
        cardForm.reset();
    }

    function showAllBoardsModal() {
        hideMenu();
        renderBoardsList();
        boardsModal.style.display = 'flex';
    }

    function hideAllBoardsModal() {
        boardsModal.style.display = 'none';
    }

    function showSettings() {
        hideMenu();
        showCustomAlert('Настройки', 'Раздел настроек будет доступен в будущем');
    }

    // Кастомное модальное окно подтверждения
    function showConfirm(title, message) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmModal.style.display = 'flex';
        
        return new Promise((resolve) => {
            confirmResolve = resolve;
        });
    }

    function handleConfirmResponse(result) {
        confirmModal.style.display = 'none';
        if (confirmResolve) {
            confirmResolve(result);
            confirmResolve = null;
        }
    }

    // Кастомное alert-окно
    function showCustomAlert(title, message) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmYes.style.display = 'none';
        confirmNo.textContent = 'OK';
        confirmModal.style.display = 'flex';
        
        return new Promise((resolve) => {
            const handler = () => {
                confirmModal.style.display = 'none';
                confirmNo.removeEventListener('click', handler);
                confirmYes.style.display = '';
                confirmNo.textContent = 'Нет';
                resolve();
            };
            
            confirmNo.addEventListener('click', handler);
        });
    }

    function renderBoardsList() {
        boardsList.innerHTML = '';
        
        if (boards.length === 0) {
            boardsList.innerHTML = '<p>Нет досок</p>';
            return;
        }
        
        boards.forEach(board => {
            const boardItem = document.createElement('div');
            boardItem.className = `board-item ${currentBoard?.id === board.id ? 'active' : ''}`;
            boardItem.textContent = board.title;
            
            boardItem.addEventListener('click', () => {
                currentBoard = board;
                updateBoardView();
                hideAllBoardsModal();
            });
            
            boardsList.appendChild(boardItem);
        });
    }

    async function handleBoardCreate(e) {
        e.preventDefault();
        const title = boardTitleInput.value.trim();
        
        if (title) {
            createBoard(title);
            hideBoardModal();
        }
    }

    async function handleBoardDelete() {
        if (!currentBoard) return;
        
        const isConfirmed = await showConfirm(
            'Удаление доски',
            `Вы уверены, что хотите удалить доску "${currentBoard.title}"?`
        );
        
        if (isConfirmed) {
            boards = boards.filter(b => b.id !== currentBoard.id);
            saveToLocalStorage();
            
            if (boards.length > 0) {
                currentBoard = boards[0];
            } else {
                currentBoard = null;
            }
            
            updateBoardView();
        }
    }

    async function handleCardSave(e) {
        e.preventDefault();
        const title = cardTitleInput.value.trim();
        const content = cardContentInput.value.trim();
        const id = cardIdInput.value || Date.now().toString();
        
        if (title && currentBoard) {
            if (currentCard) {
                // Редактирование существующей карточки
                const card = currentBoard.cards.find(c => c.id === currentCard.id);
                if (card) {
                    card.title = title;
                    card.content = content;
                }
            } else {
                // Создание новой карточки
                currentBoard.cards.push({
                    id,
                    title,
                    content
                });
            }
            
            renderCards();
            saveToLocalStorage();
            hideCardModal();
        }
    }

    async function handleCardDelete() {
        if (!currentCard || !currentBoard) return;
        
        const isConfirmed = await showConfirm(
            'Удаление карточки',
            'Вы уверены, что хотите удалить эту карточку?'
        );
        
        if (isConfirmed) {
            currentBoard.cards = currentBoard.cards.filter(c => c.id !== currentCard.id);
            renderCards();
            saveToLocalStorage();
            hideCardModal();
        }
    }

    function createBoard(title) {
        const board = {
            id: Date.now().toString(),
            title,
            cards: []
        };
        
        boards.push(board);
        currentBoard = board;
        updateBoardView();
        saveToLocalStorage();
    }

    function updateBoardView() {
        if (currentBoard) {
            boardTitleElement.textContent = currentBoard.title;
            addCardBtn.classList.remove('hidden');
            deleteBoardBtn.classList.remove('hidden');
            renderCards();
        } else {
            boardTitleElement.textContent = 'Выберите доску';
            addCardBtn.classList.add('hidden');
            deleteBoardBtn.classList.add('hidden');
            cardsContainer.innerHTML = '';
        }
    }

    function renderCards() {
        cardsContainer.innerHTML = '';
        
        if (currentBoard && currentBoard.cards.length > 0) {
            currentBoard.cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.innerHTML = `
                    <div class="card-title">${card.title}</div>
                    <div class="card-content">${card.content || ''}</div>
                `;
                
                cardElement.addEventListener('click', () => {
                    currentCard = card;
                    cardIdInput.value = card.id;
                    cardTitleInput.value = card.title;
                    cardContentInput.value = card.content || '';
                    showCardModal();
                });
                
                cardsContainer.appendChild(cardElement);
            });
        }
    }

    function loadFromLocalStorage() {
        const savedBoards = localStorage.getItem('taskBoards');
        if (savedBoards) {
            boards = JSON.parse(savedBoards);
            if (boards.length > 0) {
                currentBoard = boards[0];
                updateBoardView();
            }
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('taskBoards', JSON.stringify(boards));
    }
});