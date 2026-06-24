const authModal = document.getElementById('auth-modal');
const loginButton = document.querySelector('.navbar .btn-login');
const registerButton = document.querySelector('.navbar .btn-primary');

const closeButton = authModal ? authModal.querySelector('.modal__close-button') : null;
const overlay = authModal ? authModal.querySelector('.modal__overlay') : null;
const tabButtons = authModal ? Array.from(authModal.querySelectorAll('.modal__tab')) : [];
const tabPanels = authModal ? Array.from(authModal.querySelectorAll('.modal__panel')) : [];

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


// MODAL DE RESERVA

const reservaModal = document.getElementById('reserva-modal');
const reservaOverlay = document.getElementById('reserva-overlay');
const reservaCloseButton = document.getElementById('reserva-close');
const reservaForm = document.getElementById('reserva-form');
const reservaMessage = document.getElementById('reserva-message');

const reservaButtons = Array.from(document.querySelectorAll('.btn-reservar'));

const reservaQuadra = document.getElementById('reserva-quadra');
const reservaModalidade = document.getElementById('reserva-modalidade');
const reservaLocal = document.getElementById('reserva-local');
const reservaPreco = document.getElementById('reserva-preco');
const horarioButtons = Array.from(document.querySelectorAll('.horario-btn'));
const reservaHorarioInput = document.getElementById('reserva-horario');
const horarioSelecionadoTexto = document.getElementById('horario-selecionado'); 

function openReservaModal(button){
    if(!reservaModal) return;

    const quadra = button.dataset.quadra;
    const modalidade = button.dataset.modalidade;
    const local = button.dataset.local;
    const preco = button.dataset.preco;

    reservaQuadra.textContent = quadra;
    reservaModalidade.textContent = modalidade;
    reservaLocal.textContent = local;
    reservaPreco.textContent = preco;

    const buscaData = document.getElementById('busca-data')?.value;

    if(buscaData){
        document.getElementById('reserva-data').value = buscaData;
    }

    limparHorarioSelecionado();

    reservaMessage.textContent = '';
    reservaMessage.className = 'reserva-message';

    reservaModal.classList.remove('modal--hidden');
    setBodyScrollLocked(true);
}

function limparHorarioSelecionado(){
    if(reservaHorarioInput){
        reservaHorarioInput.value = '';
    }

    if(horarioSelecionadoTexto){
        horarioSelecionadoTexto.textContent = 'Nenhum horário selecionado';
    }

    horarioButtons.forEach(button => {
        button.classList.remove('horario-btn--selecionado');
    });
}

function selecionarHorario(button){
    if(button.disabled) return;

    const horario = button.dataset.horario;

    reservaHorarioInput.value = horario;

    horarioButtons.forEach(item => {
        item.classList.remove('horario-btn--selecionado');
    });

    button.classList.add('horario-btn--selecionado');

    horarioSelecionadoTexto.innerHTML = `
        Horário selecionado: <strong>${horario}</strong>
    `;
}

horarioButtons.forEach(button => {
    button.addEventListener('click', function(){
        selecionarHorario(button);
    });
});

function closeReservaModal(){
    if(!reservaModal) return;

    reservaModal.classList.add('modal--hidden');
    setBodyScrollLocked(false);

    reservaMessage.textContent = '';
    reservaMessage.className = 'reserva-message';

    limparHorarioSelecionado();
}

reservaButtons.forEach(button => {
    button.addEventListener('click', () => {
        openReservaModal(button);
    });
});

if(reservaCloseButton){
    reservaCloseButton.addEventListener('click', closeReservaModal);
}

if(reservaOverlay){
    reservaOverlay.addEventListener('click', closeReservaModal);
}

if(reservaForm){
    reservaForm.addEventListener('submit', function(event){
        event.preventDefault();

        const nome = document.getElementById('reserva-nome').value.trim();
        const telefone = document.getElementById('reserva-telefone').value.trim();
        const data = document.getElementById('reserva-data').value;
        const horario = document.getElementById('reserva-horario').value;
        const duracao = document.getElementById('reserva-duracao').value;
        const observacoes = document.getElementById('reserva-observacoes').value.trim();

        if(nome === '' || telefone === '' || data === '' || horario === '' || duracao === ''){
            reservaMessage.textContent = 'Preencha todos os campos obrigatórios.';
            reservaMessage.className = 'reserva-message error';
            return;
        }

        const novaReserva = {
            quadra: reservaQuadra.textContent,
            modalidade: reservaModalidade.textContent,
            local: reservaLocal.textContent,
            preco: reservaPreco.textContent,
            nome: nome,
            telefone: telefone,
            data: data,
            horario: horario,
            duracao: duracao,
            observacoes: observacoes
        };

        const reservasSalvas = JSON.parse(localStorage.getItem('reservasSportRent')) || [];

        reservasSalvas.push(novaReserva);

        localStorage.setItem('reservasSportRent', JSON.stringify(reservasSalvas));

        reservaMessage.textContent = 'Reserva realizada com sucesso!';
        reservaMessage.className = 'reserva-message success';

        setTimeout(() => {
            reservaForm.reset();
            closeReservaModal();
        }, 1500);
    });
}