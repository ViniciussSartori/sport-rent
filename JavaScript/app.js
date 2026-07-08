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
let quadraSelecionadaId = null;

const reservaQuadra = document.getElementById('reserva-quadra');
const reservaModalidade = document.getElementById('reserva-modalidade');
const reservaLocal = document.getElementById('reserva-local');
const reservaPreco = document.getElementById('reserva-preco');
const horarioButtons = Array.from(document.querySelectorAll('.horario-btn'));
const reservaHorarioInput = document.getElementById('reserva-horario');
const horarioSelecionadoTexto = document.getElementById('horario-selecionado'); 

function openReservaModal(button){
    if(!reservaModal) return;

    quadraSelecionadaId = button.dataset.quadraId;

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
    reservaForm.addEventListener('submit', async function(event){
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

        if(!quadraSelecionadaId){
            reservaMessage.textContent = 'Erro: nenhuma quadra selecionada.';
            reservaMessage.className = 'reserva-message error';
            return;
        }

        const formData = new FormData();

        formData.append('quadra_id', quadraSelecionadaId);
        formData.append('nome_cliente', nome);
        formData.append('telefone', telefone);
        formData.append('data_reserva', data);
        formData.append('horario', horario);
        formData.append('duracao', duracao);
        formData.append('observacoes', observacoes);

        try {
            const resposta = await fetch('api/reservar.php', {
                method: 'POST',
                body: formData
            });

            const dados = await resposta.json();

            if(dados.status === 'sucesso'){
                reservaMessage.textContent = dados.mensagem;
                reservaMessage.className = 'reserva-message success';

                setTimeout(() => {
                    reservaForm.reset();
                    closeReservaModal();
                }, 1500);
            }else{
                reservaMessage.textContent = dados.mensagem;
                reservaMessage.className = 'reserva-message error';
            }
        } catch (erro) {
            reservaMessage.textContent = 'Erro ao conectar com o servidor.';
            reservaMessage.className = 'reserva-message error';
            console.error(erro);
        }
    });
}

// MODAL DE CAMPEONATOS
const todosCampeonatosModal = document.getElementById('todos-campeonatos-modal');
const todosCampeonatosOverlay = document.getElementById('todos-campeonatos-overlay');
const todosCampeonatosCloseButton = document.getElementById('todos-campeonatos-close');
const verTodosCampeonatosButton = document.querySelector('.campeonatos-buttons .btn-secondary');

function openTodosCampeonatosModal(){
    if(!todosCampeonatosModal) return;

    todosCampeonatosModal.classList.remove('modal--hidden');
    setBodyScrollLocked(true);
}

function closeTodosCampeonatosModal(){
    if(!todosCampeonatosModal) return;

    todosCampeonatosModal.classList.add('modal--hidden');
    setBodyScrollLocked(false);
}

if(verTodosCampeonatosButton){
    verTodosCampeonatosButton.addEventListener('click', openTodosCampeonatosModal);
}

if(todosCampeonatosCloseButton){
    todosCampeonatosCloseButton.addEventListener('click', closeTodosCampeonatosModal);
}

if(todosCampeonatosOverlay){
    todosCampeonatosOverlay.addEventListener('click', closeTodosCampeonatosModal);
}

// MODAL DE INSCRIÇÃO
const inscricaoModal = document.getElementById('inscricao-modal');
const inscricaoOverlay = document.getElementById('inscricao-overlay');
const inscricaoCloseButton = document.getElementById('inscricao-close');
const inscricaoButtons = Array.from(document.querySelectorAll('.btn-inscrever'));
const inscricaoForm = document.getElementById('inscricao-form');
const inscricaoMessage = document.getElementById('inscricao-message');

const inscricaoCampeonato = document.getElementById('inscricao-campeonato');
const inscricaoModalidade = document.getElementById('inscricao-modalidade');
const inscricaoLocal = document.getElementById('inscricao-local');
const inscricaoVagas = document.getElementById('inscricao-vagas');
let campeonatoSelecionadoNome = null;

function openInscricaoModal(button){
    if(!inscricaoModal) return;

    campeonatoSelecionadoNome = button.dataset.campeonato;

    if(inscricaoCampeonato){
        inscricaoCampeonato.textContent = button.dataset.campeonato || 'Campeonato';
    }

    if(inscricaoModalidade){
        inscricaoModalidade.textContent = button.dataset.modalidade || '-';
    }

    if(inscricaoLocal){
        inscricaoLocal.textContent = button.dataset.local || '-';
    }

    if(inscricaoVagas){
        inscricaoVagas.textContent = button.dataset.vagas || '-';
    }

    if(inscricaoMessage){
        inscricaoMessage.textContent = '';
        inscricaoMessage.className = 'reserva-message';
    }

    inscricaoModal.classList.remove('modal--hidden');
    setBodyScrollLocked(true);
}

function closeInscricaoModal(){
    if(!inscricaoModal) return;

    inscricaoModal.classList.add('modal--hidden');
    setBodyScrollLocked(false);

    if(inscricaoMessage){
        inscricaoMessage.textContent = '';
        inscricaoMessage.className = 'reserva-message';
    }
}

inscricaoButtons.forEach(button => {
    button.addEventListener('click', () => {
        openInscricaoModal(button);
    });
});

if(inscricaoCloseButton){
    inscricaoCloseButton.addEventListener('click', closeInscricaoModal);
}

if(inscricaoOverlay){
    inscricaoOverlay.addEventListener('click', closeInscricaoModal);
}

if(inscricaoForm){
    inscricaoForm.addEventListener('submit', async function(event){
        event.preventDefault();

        const nome = document.getElementById('inscricao-nome').value.trim();
        const telefone = document.getElementById('inscricao-telefone').value.trim();
        const email = document.getElementById('inscricao-email').value.trim();

        if(!nome || !telefone || !email){
            inscricaoMessage.textContent = 'Preencha todos os campos.';
            inscricaoMessage.className = 'reserva-message error';
            return;
        }

        if(!campeonatoSelecionadoNome){
            inscricaoMessage.textContent = 'Erro: nenhum campeonato selecionado.';
            inscricaoMessage.className = 'reserva-message error';
            return;
        }

        const formData = new FormData();

        formData.append('campeonato_nome', campeonatoSelecionadoNome);
        formData.append('nome_responsavel', nome);
        formData.append('telefone', telefone);
        formData.append('email', email);

        try {
            const resposta = await fetch('api/inscrever_campeonato.php', {
                method: 'POST',
                body: formData
            });

            const dados = await resposta.json();

            if(dados.status === 'sucesso'){
                inscricaoMessage.textContent = dados.mensagem;
                inscricaoMessage.className = 'reserva-message success';

                setTimeout(() => {
                    inscricaoForm.reset();
                    closeInscricaoModal();
                }, 1500);
            }else{
                inscricaoMessage.textContent = dados.mensagem;
                inscricaoMessage.className = 'reserva-message error';
            }
        } catch (erro) {
            inscricaoMessage.textContent = 'Erro ao conectar com o servidor.';
            inscricaoMessage.className = 'reserva-message error';
            console.error(erro);
        }
    });
}

// MODAL DE CRIAR CAMPEONATO
const criarCampeonatoModal = document.getElementById('criar-campeonato-modal');
const criarCampeonatoOverlay = document.getElementById('criar-campeonato-overlay');
const criarCampeonatoCloseButton = document.getElementById('criar-campeonato-close');
const criarCampeonatoButton = document.querySelector('.campeonatos-buttons .btn-primary');
const criarCampeonatoForm = document.getElementById('criar-campeonato-form');
const criarCampeonatoMessage = document.getElementById('criar-campeonato-message');

function openCriarCampeonatoModal(){
    if(!criarCampeonatoModal) return;

    criarCampeonatoMessage.textContent = '';
    criarCampeonatoMessage.className = 'reserva-message';

    criarCampeonatoModal.classList.remove('modal--hidden');
    setBodyScrollLocked(true);
}

function closeCriarCampeonatoModal(){
    if(!criarCampeonatoModal) return;

    criarCampeonatoModal.classList.add('modal--hidden');
    setBodyScrollLocked(false);

    criarCampeonatoMessage.textContent = '';
    criarCampeonatoMessage.className = 'reserva-message';
}

if(criarCampeonatoButton){
    criarCampeonatoButton.addEventListener('click', openCriarCampeonatoModal);
}

if(criarCampeonatoCloseButton){
    criarCampeonatoCloseButton.addEventListener('click', closeCriarCampeonatoModal);
}

if(criarCampeonatoOverlay){
    criarCampeonatoOverlay.addEventListener('click', closeCriarCampeonatoModal);
}

if(criarCampeonatoForm){
    criarCampeonatoForm.addEventListener('submit', async function(event){
        event.preventDefault();

        const nome = document.getElementById('criar-campeonato-nome').value.trim();
        const modalidade = document.getElementById('criar-campeonato-modalidade').value.trim();
        const local = document.getElementById('criar-campeonato-local').value.trim();
        const dataInicio = document.getElementById('criar-campeonato-data-inicio').value;
        const dataFim = document.getElementById('criar-campeonato-data-fim').value;
        const premiacao = document.getElementById('criar-campeonato-premiacao').value.trim();
        const vagas = document.getElementById('criar-campeonato-vagas').value.trim();

        const campos = {
            nome,
            modalidade,
            local,
            dataInicio,
            dataFim,
            premiacao,
            vagas
        };

        console.log("Valores do campeonato:", campos);

        const camposVazios = [];

        if(!nome) camposVazios.push("Nome do campeonato");
        if(!modalidade) camposVazios.push("Modalidade");
        if(!local) camposVazios.push("Local");
        if(!dataInicio) camposVazios.push("Data de início");
        if(!dataFim) camposVazios.push("Data de término");
        if(!premiacao) camposVazios.push("Premiação");
        if(!vagas) camposVazios.push("Número de vagas");

        if(camposVazios.length > 0){
            criarCampeonatoMessage.textContent = "Faltando: " + camposVazios.join(", ");
            criarCampeonatoMessage.className = "reserva-message error";
            return;
        }

        const formData = new FormData();

        formData.append('nome', nome);
        formData.append('modalidade', modalidade);
        formData.append('localizacao', local);
        formData.append('data_inicio', dataInicio);
        formData.append('data_fim', dataFim);
        formData.append('premio', premiacao);
        formData.append('vagas_total', vagas);

        try {
            const resposta = await fetch('api/criar_campeonato.php', {
                method: 'POST',
                body: formData
            });

            const textoResposta = await resposta.text();
            console.log("Resposta do PHP:", textoResposta);

            const dados = JSON.parse(textoResposta);

            if(dados.status === 'sucesso'){
                criarCampeonatoMessage.textContent = dados.mensagem;
                criarCampeonatoMessage.className = 'reserva-message success';

                setTimeout(() => {
                    criarCampeonatoForm.reset();
                    closeCriarCampeonatoModal();
                }, 1500);
            }else{
                criarCampeonatoMessage.textContent = dados.mensagem;
                criarCampeonatoMessage.className = 'reserva-message error';
            }
        } catch (erro) {
            criarCampeonatoMessage.textContent = 'Erro ao conectar com o servidor.';
            criarCampeonatoMessage.className = 'reserva-message error';
            console.error(erro);
        }
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

// =======================
// BANCO DE DADOS - CADASTRO, LOGIN E CONTATO
// =======================

async function enviarParaAPI(url, formData) {
    const resposta = await fetch(url, {
        method: "POST",
        body: formData
    });

    return await resposta.json();
}

// CADASTRO
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(registerForm);

        try {
            const dados = await enviarParaAPI("api/cadastrar.php", formData);

            alert(dados.mensagem);

            if (dados.status === "sucesso") {
                registerForm.reset();
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor.");
            console.error(erro);
        }
    });
}

// LOGIN
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);

        try {
            const dados = await enviarParaAPI("api/login.php", formData);

            alert(dados.mensagem);

            if (dados.status === "sucesso") {
                localStorage.setItem("usuario", JSON.stringify(dados.usuario));
                console.log("Usuário logado:", dados.usuario);
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor.");
            console.error(erro);
        }
    });
}

// CONTATO
const contatoForm = document.getElementById("contato-form");

if (contatoForm) {
    contatoForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(contatoForm);

        try {
            const dados = await enviarParaAPI("api/contato.php", formData);

            alert(dados.mensagem);

            if (dados.status === "sucesso") {
                contatoForm.reset();
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor.");
            console.error(erro);
        }
    });
}
