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

    limparDataSelecionada();

    if(buscaData){
        reservaDataInput.value = buscaData;
        atualizarTextoDataSelecionada(buscaData);
    }else{
        reservaDataInput.value = '';
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
    limparDataSelecionada();
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

// SELEÇÃO PROFISSIONAL DE DATA

const buscaDataInput = document.getElementById('busca-data');
const reservaDataInput = document.getElementById('reserva-data');

const dataButtons = Array.from(document.querySelectorAll('.data-btn'));
const dataSelecionadaTexto = document.getElementById('data-selecionada');

const dataHojeTexto = document.getElementById('data-hoje');
const dataAmanhaTexto = document.getElementById('data-amanha');
const dataDepoisTexto = document.getElementById('data-depois');

function formatarDataInput(data){
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function formatarDataBR(data){
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
    });
}

function obterDataComAcrescimo(dias){
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    data.setDate(data.getDate() + dias);

    return data;
}

function configurarDatasMinimas(){
    const hoje = formatarDataInput(obterDataComAcrescimo(0));

    if(buscaDataInput){
        buscaDataInput.min = hoje;
    }

    if(reservaDataInput){
        reservaDataInput.min = hoje;
    }
}

function preencherDatasRapidas(){
    if(dataHojeTexto){
        dataHojeTexto.textContent = formatarDataBR(obterDataComAcrescimo(0));
    }

    if(dataAmanhaTexto){
        dataAmanhaTexto.textContent = formatarDataBR(obterDataComAcrescimo(1));
    }

    if(dataDepoisTexto){
        dataDepoisTexto.textContent = formatarDataBR(obterDataComAcrescimo(2));
    }
}

function limparDataSelecionada(){
    dataButtons.forEach(button => {
        button.classList.remove('data-btn--selecionada');
    });

    if(dataSelecionadaTexto){
        dataSelecionadaTexto.textContent = 'Nenhuma data selecionada';
    }
}

function atualizarTextoDataSelecionada(valorData){
    if(!valorData || !dataSelecionadaTexto) return;

    const [ano, mes, dia] = valorData.split('-');

    dataSelecionadaTexto.innerHTML = `
        Data selecionada: <strong>${dia}/${mes}/${ano}</strong>
    `;
}

function selecionarDataRapida(button){
    const dias = Number(button.dataset.dias);
    const data = obterDataComAcrescimo(dias);
    const dataFormatada = formatarDataInput(data);

    if(reservaDataInput){
        reservaDataInput.value = dataFormatada;
    }

    dataButtons.forEach(item => {
        item.classList.remove('data-btn--selecionada');
    });

    button.classList.add('data-btn--selecionada');

    atualizarTextoDataSelecionada(dataFormatada);
}

dataButtons.forEach(button => {
    button.addEventListener('click', function(){
        selecionarDataRapida(button);
    });
});

if(reservaDataInput){
    reservaDataInput.addEventListener('change', function(){
        const hoje = formatarDataInput(obterDataComAcrescimo(0));

        if(reservaDataInput.value < hoje){
            reservaDataInput.value = hoje;
        }

        limparDataSelecionada();
        atualizarTextoDataSelecionada(reservaDataInput.value);
    });
}

if(buscaDataInput){
    buscaDataInput.addEventListener('change', function(){
        const hoje = formatarDataInput(obterDataComAcrescimo(0));

        if(buscaDataInput.value < hoje){
            buscaDataInput.value = hoje;
        }
    });
}

configurarDatasMinimas();
preencherDatasRapidas();