const authModal = document.getElementById('auth-modal');
const loginButton = document.querySelector('.navbar .btn-login');
const registerButton = document.querySelector('.navbar .btn-primary');
const closeButton = document.querySelector('.modal__close-button');
const overlay = document.querySelector('.modal__overlay');
const tabButtons = Array.from(document.querySelectorAll('.modal__tab'));
const tabPanels = Array.from(document.querySelectorAll('.modal__panel'));

function setBodyScrollLocked(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
}

function openModal(activeTab = 'login') {
    authModal.classList.remove('modal--hidden');
    setBodyScrollLocked(true);
    setActiveTab(activeTab);
}

function closeModal() {
    authModal.classList.add('modal--hidden');
    setBodyScrollLocked(false);
}

function setActiveTab(tabKey) {
    tabButtons.forEach(button => {
        const isTarget = button.getAttribute('aria-controls') === `${tabKey}-panel`;
        button.classList.toggle('modal__tab--active', isTarget);
        button.setAttribute('aria-selected', isTarget.toString());
    });

    tabPanels.forEach(panel => {
        const isActive = panel.id === `${tabKey}-panel`;
        panel.classList.toggle('modal__panel--active', isActive);
        panel.hidden = !isActive;
    });
}

if (loginButton) {
    loginButton.addEventListener('click', () => {
        openModal('login');
    });
}

if (registerButton) {
    registerButton.addEventListener('click', () => {
        openModal('register');
    });
}

if (closeButton) {
    closeButton.addEventListener('click', closeModal);
}

if (overlay) {
    overlay.addEventListener('click', closeModal);
}

if (tabButtons.length) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanel = button.getAttribute('aria-controls');
            if (!targetPanel) return;
            const tabKey = targetPanel.replace('-panel', '');
            setActiveTab(tabKey);
        });
    });
}
