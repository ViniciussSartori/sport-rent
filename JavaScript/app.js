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


// =======================
// VALIDAÇÕES VISÍVEIS
// =======================
function obterMensagemCampo(campo) {
    if (!campo || !campo.id) return null;

    let mensagem = document.querySelector(`[data-error-for="${campo.id}"]`);

    if (!mensagem) {
        mensagem = document.createElement('small');
        mensagem.className = 'field-error-message';
        mensagem.dataset.errorFor = campo.id;
        campo.insertAdjacentElement('afterend', mensagem);
    }

    return mensagem;
}

function mostrarErroCampo(campo, mensagemErro) {
    if (!campo) return;

    campo.classList.add('input-error');
    campo.setAttribute('aria-invalid', 'true');

    const mensagem = obterMensagemCampo(campo);
    if (mensagem) {
        mensagem.textContent = mensagemErro;
    }
}

function limparErroCampo(campo) {
    if (!campo) return;

    campo.classList.remove('input-error');
    campo.removeAttribute('aria-invalid');

    if (campo.id) {
        const mensagem = document.querySelector(`[data-error-for="${campo.id}"]`);
        if (mensagem) {
            mensagem.textContent = '';
        }
    }
}

function mostrarFeedback(elemento, mensagem, tipo = 'error') {
    if (!elemento) return;

    const manterClasseFeedback = elemento.classList.contains('form-feedback') ? ' form-feedback' : '';

    elemento.textContent = mensagem;
    elemento.className = `reserva-message ${tipo}${manterClasseFeedback}`;
}

function obterFeedbackFormulario(formulario) {
    let feedback = formulario.querySelector('.form-feedback');

    if (!feedback) {
        feedback = document.createElement('p');
        feedback.className = 'reserva-message form-feedback';

        const botaoSubmit = formulario.querySelector('button[type="submit"]');
        if (botaoSubmit) {
            botaoSubmit.insertAdjacentElement('beforebegin', feedback);
        } else {
            formulario.appendChild(feedback);
        }
    }

    return feedback;
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function telefoneValido(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
}

function dataHojeOuFutura(valorData) {
    if (!valorData) return false;

    const hoje = formatarDataInput(obterDataComAcrescimo(0));
    return valorData >= hoje;
}

function validarCampos(configuracoes) {
    let formularioValido = true;
    let primeiroCampoInvalido = null;

    configuracoes.forEach(({ campo, mensagem, validar }) => {
        if (!campo) return;

        const valor = campo.value.trim();
        const valido = typeof validar === 'function' ? validar(valor) : valor !== '';

        if (!valido) {
            mostrarErroCampo(campo, mensagem);
            formularioValido = false;

            if (!primeiroCampoInvalido && campo.type !== 'hidden') {
                primeiroCampoInvalido = campo;
            }
        } else {
            limparErroCampo(campo);
        }
    });

    if (primeiroCampoInvalido) {
        primeiroCampoInvalido.focus();
    }

    return formularioValido;
}

function configurarLimpezaDeErros() {
    document.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.addEventListener('input', () => limparErroCampo(campo));
        campo.addEventListener('change', () => limparErroCampo(campo));
    });
}

configurarLimpezaDeErros();

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

        const nomeCampo = document.getElementById('reserva-nome');
        const telefoneCampo = document.getElementById('reserva-telefone');
        const dataCampo = document.getElementById('reserva-data');
        const horarioCampo = document.getElementById('reserva-horario');
        const duracaoCampo = document.getElementById('reserva-duracao');
        const observacoesCampo = document.getElementById('reserva-observacoes');

        const nome = nomeCampo.value.trim();
        const telefone = telefoneCampo.value.trim();
        const data = dataCampo.value;
        const horario = horarioCampo.value;
        const duracao = duracaoCampo.value;
        const observacoes = observacoesCampo.value.trim();

        const formularioValido = validarCampos([
            { campo: nomeCampo, mensagem: 'Digite seu nome completo.', validar: valor => valor.length >= 3 },
            { campo: telefoneCampo, mensagem: 'Digite um telefone válido com DDD.', validar: telefoneValido },
            { campo: dataCampo, mensagem: 'Escolha uma data válida.', validar: dataHojeOuFutura },
            { campo: duracaoCampo, mensagem: 'Selecione a duração da reserva.' }
        ]);

        if(!formularioValido){
            mostrarFeedback(reservaMessage, 'Revise os campos destacados antes de continuar.', 'error');
            return;
        }

        if(!horario){
            mostrarFeedback(reservaMessage, 'Selecione um horário disponível para a reserva.', 'error');
            return;
        }

        if(!quadraSelecionadaId){
            mostrarFeedback(reservaMessage, 'Erro: nenhuma quadra selecionada.', 'error');
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
                mostrarFeedback(reservaMessage, dados.mensagem, 'success');

                setTimeout(() => {
                    reservaForm.reset();
                    closeReservaModal();
                }, 1500);
            }else{
                mostrarFeedback(reservaMessage, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(reservaMessage, 'Erro ao conectar com o servidor.', 'error');
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

        const nomeCampo = document.getElementById('inscricao-nome');
        const telefoneCampo = document.getElementById('inscricao-telefone');
        const emailCampo = document.getElementById('inscricao-email');

        const nome = nomeCampo.value.trim();
        const telefone = telefoneCampo.value.trim();
        const email = emailCampo.value.trim();

        const formularioValido = validarCampos([
            { campo: nomeCampo, mensagem: 'Digite o nome do responsável.', validar: valor => valor.length >= 3 },
            { campo: telefoneCampo, mensagem: 'Digite um telefone válido com DDD.', validar: telefoneValido },
            { campo: emailCampo, mensagem: 'Digite um e-mail válido.', validar: emailValido }
        ]);

        if(!formularioValido){
            mostrarFeedback(inscricaoMessage, 'Revise os campos destacados antes de continuar.', 'error');
            return;
        }

        if(!campeonatoSelecionadoNome){
            mostrarFeedback(inscricaoMessage, 'Erro: nenhum campeonato selecionado.', 'error');
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
                mostrarFeedback(inscricaoMessage, dados.mensagem, 'success');

                setTimeout(() => {
                    inscricaoForm.reset();
                    closeInscricaoModal();
                }, 1500);
            }else{
                mostrarFeedback(inscricaoMessage, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(inscricaoMessage, 'Erro ao conectar com o servidor.', 'error');
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

        const nomeCampo = document.getElementById('criar-campeonato-nome');
        const modalidadeCampo = document.getElementById('criar-campeonato-modalidade');
        const localCampo = document.getElementById('criar-campeonato-local');
        const dataInicioCampo = document.getElementById('criar-campeonato-data-inicio');
        const dataFimCampo = document.getElementById('criar-campeonato-data-fim');
        const premiacaoCampo = document.getElementById('criar-campeonato-premiacao');
        const vagasCampo = document.getElementById('criar-campeonato-vagas');

        const nome = nomeCampo.value.trim();
        const modalidade = modalidadeCampo.value.trim();
        const local = localCampo.value.trim();
        const dataInicio = dataInicioCampo.value;
        const dataFim = dataFimCampo.value;
        const premiacao = premiacaoCampo.value.trim();
        const vagas = vagasCampo.value.trim();

        const formularioValido = validarCampos([
            { campo: nomeCampo, mensagem: 'Digite o nome do campeonato.', validar: valor => valor.length >= 3 },
            { campo: modalidadeCampo, mensagem: 'Selecione uma modalidade.' },
            { campo: localCampo, mensagem: 'Digite o local do campeonato.', validar: valor => valor.length >= 3 },
            { campo: dataInicioCampo, mensagem: 'Escolha uma data de início válida.', validar: dataHojeOuFutura },
            { campo: dataFimCampo, mensagem: 'Escolha uma data de término válida.', validar: valor => valor && valor >= dataInicioCampo.value },
            { campo: premiacaoCampo, mensagem: 'Informe a premiação.', validar: valor => valor.length >= 2 },
            { campo: vagasCampo, mensagem: 'Informe no mínimo 2 vagas.', validar: valor => Number(valor) >= 2 }
        ]);

        if(!formularioValido){
            mostrarFeedback(criarCampeonatoMessage, 'Revise os campos destacados antes de criar o campeonato.', 'error');
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

            const dados = await resposta.json();

            if(dados.status === 'sucesso'){
                mostrarFeedback(criarCampeonatoMessage, dados.mensagem, 'success');

                setTimeout(() => {
                    criarCampeonatoForm.reset();
                    closeCriarCampeonatoModal();
                }, 1500);
            }else{
                mostrarFeedback(criarCampeonatoMessage, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(criarCampeonatoMessage, 'Erro ao conectar com o servidor.', 'error');
            console.error(erro);
        }
    });
}

// SELEÇÃO DE DATA

const buscaDataInput = document.getElementById('busca-data');
const reservaDataInput = document.getElementById('reserva-data');
const criarCampeonatoDataInicioInput = document.getElementById('criar-campeonato-data-inicio');
const criarCampeonatoDataFimInput = document.getElementById('criar-campeonato-data-fim');

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

    if(criarCampeonatoDataInicioInput){
        criarCampeonatoDataInicioInput.min = hoje;
    }

    if(criarCampeonatoDataFimInput){
        criarCampeonatoDataFimInput.min = hoje;
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


if(criarCampeonatoDataInicioInput){
    criarCampeonatoDataInicioInput.addEventListener('change', function(){
        const hoje = formatarDataInput(obterDataComAcrescimo(0));

        if(criarCampeonatoDataInicioInput.value < hoje){
            criarCampeonatoDataInicioInput.value = hoje;
        }

        if(criarCampeonatoDataFimInput){
            criarCampeonatoDataFimInput.min = criarCampeonatoDataInicioInput.value || hoje;

            if(criarCampeonatoDataFimInput.value && criarCampeonatoDataFimInput.value < criarCampeonatoDataInicioInput.value){
                criarCampeonatoDataFimInput.value = criarCampeonatoDataInicioInput.value;
            }
        }
    });
}

if(criarCampeonatoDataFimInput){
    criarCampeonatoDataFimInput.addEventListener('change', function(){
        const dataMinima = criarCampeonatoDataInicioInput?.value || formatarDataInput(obterDataComAcrescimo(0));

        if(criarCampeonatoDataFimInput.value < dataMinima){
            criarCampeonatoDataFimInput.value = dataMinima;
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

// BUSCA DE QUADRAS
const buscaButton = document.querySelector('.search-box .btn-primary');

if (buscaButton) {
    buscaButton.addEventListener('click', function () {
        const cidadeCampo = document.getElementById('busca-cidade');
        const dataCampo = document.getElementById('busca-data');

        const buscaValida = validarCampos([
            { campo: cidadeCampo, mensagem: 'Digite a cidade ou bairro para buscar quadras.', validar: valor => valor.length >= 2 },
            { campo: dataCampo, mensagem: 'Escolha uma data para a busca.', validar: dataHojeOuFutura }
        ]);

        if (buscaValida) {
            document.getElementById('quadras')?.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// CADASTRO
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nomeCampo = document.getElementById('register-name');
        const emailCampo = document.getElementById('register-email');
        const senhaCampo = document.getElementById('register-password');
        const confirmarSenhaCampo = document.getElementById('register-confirm-password');
        const feedback = obterFeedbackFormulario(registerForm);

        const senha = senhaCampo.value;
        const confirmarSenha = confirmarSenhaCampo.value;

        const formularioValido = validarCampos([
            { campo: nomeCampo, mensagem: 'Digite seu nome completo.', validar: valor => valor.length >= 3 },
            { campo: emailCampo, mensagem: 'Digite um e-mail válido.', validar: emailValido },
            { campo: senhaCampo, mensagem: 'A senha precisa ter pelo menos 6 caracteres.', validar: valor => valor.length >= 6 },
            { campo: confirmarSenhaCampo, mensagem: 'As senhas precisam ser iguais.', validar: () => confirmarSenha.length >= 6 && senha === confirmarSenha }
        ]);

        if (!formularioValido) {
            mostrarFeedback(feedback, 'Revise os campos destacados para continuar.', 'error');
            return;
        }

        const formData = new FormData(registerForm);

        try {
            const dados = await enviarParaAPI("api/cadastrar.php", formData);

            if (dados.status === "sucesso") {
                mostrarFeedback(feedback, dados.mensagem, 'success');
                registerForm.reset();
            } else {
                mostrarFeedback(feedback, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(feedback, 'Erro ao conectar com o servidor.', 'error');
            console.error(erro);
        }
    });
}

// LOGIN
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailCampo = document.getElementById('login-email');
        const senhaCampo = document.getElementById('login-password');
        const feedback = obterFeedbackFormulario(loginForm);

        const formularioValido = validarCampos([
            { campo: emailCampo, mensagem: 'Digite um e-mail válido.', validar: emailValido },
            { campo: senhaCampo, mensagem: 'Digite sua senha.' }
        ]);

        if (!formularioValido) {
            mostrarFeedback(feedback, 'Revise os campos destacados para entrar.', 'error');
            return;
        }

        const formData = new FormData(loginForm);

        try {
            const dados = await enviarParaAPI("api/login.php", formData);

            if (dados.status === "sucesso") {
                mostrarFeedback(feedback, dados.mensagem, 'success');
                localStorage.setItem("usuario", JSON.stringify(dados.usuario));
                console.log("Usuário logado:", dados.usuario);
            } else {
                mostrarFeedback(feedback, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(feedback, 'Erro ao conectar com o servidor.', 'error');
            console.error(erro);
        }
    });
}

// CONTATO
const contatoForm = document.getElementById("contato-form");

if (contatoForm) {
    contatoForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nomeCampo = document.getElementById('nome');
        const emailCampo = document.getElementById('email');
        const assuntoCampo = document.getElementById('assunto');
        const mensagemCampo = document.getElementById('mensagem');
        const feedback = obterFeedbackFormulario(contatoForm);

        const formularioValido = validarCampos([
            { campo: nomeCampo, mensagem: 'Digite seu nome.', validar: valor => valor.length >= 3 },
            { campo: emailCampo, mensagem: 'Digite um e-mail válido.', validar: emailValido },
            { campo: assuntoCampo, mensagem: 'Selecione um assunto.' },
            { campo: mensagemCampo, mensagem: 'Digite uma mensagem com pelo menos 10 caracteres.', validar: valor => valor.length >= 10 }
        ]);

        if (!formularioValido) {
            mostrarFeedback(feedback, 'Revise os campos destacados antes de enviar.', 'error');
            return;
        }

        const formData = new FormData(contatoForm);

        try {
            const dados = await enviarParaAPI("api/contato.php", formData);

            if (dados.status === "sucesso") {
                mostrarFeedback(feedback, dados.mensagem, 'success');
                contatoForm.reset();
            } else {
                mostrarFeedback(feedback, dados.mensagem, 'error');
            }
        } catch (erro) {
            mostrarFeedback(feedback, 'Erro ao conectar com o servidor.', 'error');
            console.error(erro);
        }
    });
}
