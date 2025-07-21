export function renderCards(cards, containers) {
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });

    cards.forEach(card => {
        const cardElement = createCardElement(card);
        if (containers[card.status]) {
            containers[card.status].appendChild(cardElement);
        }
    });
}

export function renderBoardsList(boards, currentBoardId) {
    const boardsList = document.getElementById('boards-list');
    boardsList.innerHTML = '';

    if (boards.length === 0) {
        boardsList.innerHTML = '<p>Нет досок</p>';
        return;
    }

    boards.forEach(board => {
        const boardItem = document.createElement('div');
        boardItem.className = `board-item ${board.id === currentBoardId ? 'active' : ''}`;
        boardItem.textContent = board.title;
        boardItem.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('boardSelected', { 
                detail: board.id 
            }));
            document.getElementById('boards-modal').style.display = 'none';
        });
        boardsList.appendChild(boardItem);
    });
}

export function showConfirmModal(title, message) {
    const modal = document.getElementById('confirm-modal');
    const titleElement = document.getElementById('confirm-title');
    const messageElement = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    return new Promise((resolve) => {
        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        const onYes = () => {
            cleanup();
            resolve(true);
        };

        const onNo = () => {
            cleanup();
            resolve(false);
        };

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    });
}

export function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
    
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.id = card.id;
    cardElement.draggable = true;
    cardElement.innerHTML = `
        <div class="card-title">${card.title}</div>
        <div class="card-content">${card.content || ''}</div>
    `;
    
    cardElement.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cardSelected', { detail: card.id }));
    });
    
    return cardElement;
}

function setupModalCloseHandlers() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
    });

    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

export function setupUIEventListeners(handlers) {
    const menuBtn = document.getElementById('menu-btn');
    const allBoardsBtn = document.getElementById('all-boards-btn');
    const createBoardBtn = document.getElementById('create-board-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const addCardBtn = document.getElementById('add-card-btn');
    const deleteBoardBtn = document.getElementById('delete-board-btn');
    const boardForm = document.getElementById('board-form');
    const cardForm = document.getElementById('card-form');
    const cancelBoardBtn = document.getElementById('cancel-board-btn');
    const cancelCardBtn = document.getElementById('cancel-card-btn');
    const deleteCardBtn = document.getElementById('delete-card-btn');
    const closeBoardsBtn = document.getElementById('close-boards-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // Инициализация темы
    setupTheme();

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.dropdown-content').classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target)) {
            document.querySelector('.dropdown-content').classList.add('hidden');
        }
    });

    allBoardsBtn.addEventListener('click', handlers.onShowBoardsList);
    createBoardBtn.addEventListener('click', () => {
        document.getElementById('board-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.getElementById('board-title-input').focus();
    });
    settingsBtn.addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    addCardBtn?.addEventListener('click', handlers.onAddCardClick);
    deleteBoardBtn?.addEventListener('click', handlers.onBoardDelete);

    boardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('board-title-input').value.trim();
        if (title) {
            handlers.onBoardCreate(title);
            boardForm.reset();
            document.getElementById('board-modal').style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    cancelBoardBtn.addEventListener('click', () => {
        boardForm.reset();
        document.getElementById('board-modal').style.display = 'none';
        document.body.style.overflow = '';
    });

    cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cardData = {
            id: document.getElementById('card-id-input').value,
            title: document.getElementById('card-title-input').value.trim(),
            content: document.getElementById('card-content-input').value.trim(),
            status: document.getElementById('card-status-input').value
        };
        
        if (cardData.title) {
            handlers.onCardSave(cardData);
            cardForm.reset();
            document.getElementById('card-modal').style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    cancelCardBtn.addEventListener('click', () => {
        cardForm.reset();
        document.getElementById('card-modal').style.display = 'none';
        document.body.style.overflow = '';
    });

    deleteCardBtn.addEventListener('click', () => {
        const cardId = document.getElementById('card-id-input').value;
        if (cardId) {
            handlers.onCardDelete(cardId);
        }
    });

    closeBoardsBtn.addEventListener('click', () => {
        document.getElementById('boards-modal').style.display = 'none';
        document.body.style.overflow = '';
    });

    closeSettingsBtn.addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
        document.body.style.overflow = '';
    });

    setupModalCloseHandlers();
}