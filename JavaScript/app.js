const $ = (seletor, contexto = document) =>
    contexto.querySelector(seletor);

const $$ = (seletor, contexto = document) =>
    Array.from(
        contexto.querySelectorAll(seletor)
    );

const CIDADES_CAMPEONATO = [
    "Abadia dos Dourados",
    "Água Comprida",
    "Araguari",
    "Araporã",
    "Arapuá",
    "Araxá",
    "Cachoeira Dourada",
    "Campina Verde",
    "Campo Florido",
    "Campos Altos",
    "Canápolis",
    "Capinópolis",
    "Carmo do Paranaíba",
    "Carneirinho",
    "Cascalho Rico",
    "Centralina",
    "Comendador Gomes",
    "Conceição das Alagoas",
    "Conquista",
    "Coromandel",
    "Cruzeiro da Fortaleza",
    "Delta",
    "Douradoquara",
    "Estrela do Sul",
    "Fronteira",
    "Frutal",
    "Grupiara",
    "Guimarânia",
    "Gurinhatã",
    "Ibiá",
    "Indianópolis",
    "Ipiaçu",
    "Iraí de Minas",
    "Itapagipe",
    "Ituiutaba",
    "Iturama",
    "Lagoa Formosa",
    "Limeira do Oeste",
    "Matutina",
    "Monte Alegre de Minas",
    "Monte Carmelo",
    "Nova Ponte",
    "Patos de Minas",
    "Patrocínio",
    "Pedrinópolis",
    "Perdizes",
    "Pirajuba",
    "Planura",
    "Prata",
    "Pratinha",
    "Rio Paranaíba",
    "Romaria",
    "Sacramento",
    "Santa Juliana",
    "Santa Rosa da Serra",
    "Santa Vitória",
    "São Francisco de Sales",
    "São Gotardo",
    "Serra do Salitre",
    "Tapira",
    "Tiros",
    "Tupaciguara",
    "Uberaba",
    "Uberlândia",
    "União de Minas",
    "Veríssimo"
];

function setBodyScrollLocked(locked) {
    document.body.style.overflow =
        locked ? "hidden" : "";
}

async function fetchJson(
    url,
    options = {}
) {
    const resposta =
        await fetch(url, options);

    const texto =
        await resposta.text();

    let dados;

    try {
        dados = JSON.parse(texto);
    } catch {
        throw new Error(
            `Resposta inválida do servidor: ${
                texto || "resposta vazia"
            }`
        );
    }

    if (
        !resposta.ok ||
        dados.status === "erro"
    ) {
        throw new Error(
            dados.mensagem ||
            `Erro HTTP ${resposta.status}`
        );
    }

    return dados;
}

function escaparHtml(valor) {
    const mapa = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(valor ?? "").replace(
        /[&<>"']/g,
        caractere => mapa[caractere]
    );
}

function mostrarMensagem(
    elemento,
    mensagem,
    tipo = ""
) {
    if (!elemento) {
        return;
    }

    elemento.textContent =
        mensagem;

    elemento.className =
        tipo
            ? `reserva-message ${tipo}`
            : "reserva-message";
}

function obterHojeLocalISO() {
    const data =
        new Date();

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function obterDataComAcrescimo(
    dias
) {
    const data =
        new Date();

    data.setHours(
        0,
        0,
        0,
        0
    );

    data.setDate(
        data.getDate() + dias
    );

    return data;
}

function formatarDataInput(
    data
) {
    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function converterMoedaParaNumero(
    valor
) {
    if (
        typeof valor === "number"
    ) {
        return Number.isFinite(valor)
            ? valor
            : null;
    }

    let texto =
        String(valor ?? "")
            .trim()
            .replace(
                /R\$/gi,
                ""
            )
            .replace(
                /\s/g,
                ""
            );

    if (!texto) {
        return null;
    }

    if (
        /^-?\d{1,3}(\.\d{3})+$/.test(
            texto
        )
    ) {
        texto =
            texto.replace(
                /\./g,
                ""
            );
    } else if (
        /^-?\d+(\.\d+)?$/.test(
            texto
        )
    ) {
        const numero =
            Number(texto);

        return Number.isFinite(
            numero
        )
            ? numero
            : null;
    }

    texto =
        texto.replace(
            /[^\d,.-]/g,
            ""
        );

    if (
        texto.includes(",")
    ) {
        texto =
            texto
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );
    }

    const numero =
        Number(texto);

    return Number.isFinite(
        numero
    )
        ? numero
        : null;
}

function formatarMoeda(
    valor
) {
    const numero =
        converterMoedaParaNumero(
            valor
        );

    return numero === null
        ? "R$ 0,00"
        : numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}

function normalizarTexto(
    valor
) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}

function obterLocalizacaoCampeonato(
    campeonato
) {
    const local =
        String(
            campeonato.local ||
            campeonato.localizacao ||
            ""
        ).trim();

    const cidade =
        String(
            campeonato.cidade ||
            ""
        ).trim();

    if (
        !local &&
        !cidade
    ) {
        return "-";
    }

    if (!cidade) {
        return local || "-";
    }

    if (!local) {
        return cidade;
    }

    const localNormalizado =
        normalizarTexto(local);

    const cidadeNormalizada =
        normalizarTexto(cidade);

    if (
        localNormalizado.includes(
            cidadeNormalizada
        )
    ) {
        return local;
    }

    return `${local} - ${cidade}`;
}

function garantirCampoCidadeCampeonato() {
    const existente =
        $(
            "#criar-campeonato-cidade"
        );

    if (existente) {
        return existente;
    }

    const campoLocal =
        $(
            "#criar-campeonato-local"
        )?.closest(
            ".modal__field"
        );

    if (!campoLocal) {
        return null;
    }

    const campoCidade =
        document.createElement(
            "div"
        );

    campoCidade.className =
        "modal__field";

    campoCidade.innerHTML = `
        <label
            class="modal__label"
            for="criar-campeonato-cidade"
        >
            Cidade
        </label>

        <select
            class="modal__input"
            id="criar-campeonato-cidade"
            name="cidade"
            required
        >
            <option value="">
                Selecione a cidade
            </option>

            ${
                CIDADES_CAMPEONATO
                    .map(
                        cidade => `
                            <option
                                value="${escaparHtml(cidade)}"
                            >
                                ${escaparHtml(cidade)}
                            </option>
                        `
                    )
                    .join("")
            }
        </select>
    `;

    campoLocal.insertAdjacentElement(
        "afterend",
        campoCidade
    );

    return $(
        "#criar-campeonato-cidade"
    );
}


// ======================================================
// LOGIN E CADASTRO
// ======================================================

const authModal =
    $("#auth-modal");

const loginButton =
    $(".navbar .btn-login");

const registerButton =
    $(".navbar .btn-primary");

let closeAuthModal =
    () => {};

if (authModal) {
    const closeButton =
        $(
            ".modal__close-button",
            authModal
        );

    const overlay =
        $(
            ".modal__overlay",
            authModal
        );

    const tabButtons =
        $$(
            ".modal__tab",
            authModal
        );

    const tabPanels =
        $$(
            ".modal__panel",
            authModal
        );

    function setActiveTab(
        tabKey
    ) {
        tabButtons.forEach(
            button => {
                const ativo =
                    button.getAttribute(
                        "aria-controls"
                    ) ===
                    `${tabKey}-panel`;

                button.classList.toggle(
                    "modal__tab--active",
                    ativo
                );

                button.setAttribute(
                    "aria-selected",
                    String(ativo)
                );
            }
        );

        tabPanels.forEach(
            panel => {
                const ativo =
                    panel.id ===
                    `${tabKey}-panel`;

                panel.classList.toggle(
                    "modal__panel--active",
                    ativo
                );

                panel.hidden =
                    !ativo;
            }
        );
    }

    function openAuthModal(
        tab = "login"
    ) {
        authModal.classList.remove(
            "modal--hidden"
        );

        setActiveTab(tab);
        setBodyScrollLocked(true);
    }

    closeAuthModal =
        function () {
            authModal.classList.add(
                "modal--hidden"
            );

            setBodyScrollLocked(
                false
            );
        };

    loginButton?.addEventListener(
        "click",
        () =>
            openAuthModal(
                "login"
            )
    );

    registerButton?.addEventListener(
        "click",
        () =>
            openAuthModal(
                "register"
            )
    );

    closeButton?.addEventListener(
        "click",
        closeAuthModal
    );

    overlay?.addEventListener(
        "click",
        closeAuthModal
    );

    tabButtons.forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    const destino =
                        button.getAttribute(
                            "aria-controls"
                        );

                    if (destino) {
                        setActiveTab(
                            destino.replace(
                                "-panel",
                                ""
                            )
                        );
                    }
                }
            );
        }
    );
}


// ======================================================
// DATAS
// ======================================================

const buscaDataInput =
    $("#busca-data");

const reservaDataInput =
    $("#reserva-data");

const dataButtons =
    $$(".data-btn");

const dataSelecionadaTexto =
    $("#data-selecionada");

const dataHojeTexto =
    $("#data-hoje");

const dataAmanhaTexto =
    $("#data-amanha");

const dataDepoisTexto =
    $("#data-depois");

function configurarDatasMinimas() {
    const hoje =
        obterHojeLocalISO();

    if (buscaDataInput) {
        buscaDataInput.min =
            hoje;
    }

    if (reservaDataInput) {
        reservaDataInput.min =
            hoje;
    }
}

function preencherDatasRapidas() {
    const formato =
        data =>
            data.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit"
                }
            );

    if (dataHojeTexto) {
        dataHojeTexto.textContent =
            formato(
                obterDataComAcrescimo(
                    0
                )
            );
    }

    if (dataAmanhaTexto) {
        dataAmanhaTexto.textContent =
            formato(
                obterDataComAcrescimo(
                    1
                )
            );
    }

    if (dataDepoisTexto) {
        dataDepoisTexto.textContent =
            formato(
                obterDataComAcrescimo(
                    2
                )
            );
    }
}

function limparDataSelecionada() {
    dataButtons.forEach(
        button =>
            button.classList.remove(
                "data-btn--selecionada"
            )
    );

    if (
        dataSelecionadaTexto
    ) {
        dataSelecionadaTexto.textContent =
            "Nenhuma data selecionada";
    }
}

function atualizarTextoDataSelecionada(
    valor
) {
    if (
        !valor ||
        !dataSelecionadaTexto
    ) {
        return;
    }

    const [
        ano,
        mes,
        dia
    ] =
        valor.split("-");

    dataSelecionadaTexto.innerHTML = `
        Data selecionada:
        <strong>
            ${dia}/${mes}/${ano}
        </strong>
    `;
}


// ======================================================
// QUADRAS
// ======================================================

const quadrasDestaqueLista =
    $(
        "#quadras-destaque-lista"
    );

function criarCardQuadra(
    quadra
) {
    const imagem =
        String(
            quadra.imagem ||
            ""
        ).trim() ||
        "Assets/quadra1.jpg";

    const local =
        String(
            quadra.localizacao ||
            ""
        ).trim() ||
        [
            quadra.cidade,
            quadra.estado
        ]
            .filter(Boolean)
            .join(" - ") ||
        String(
            quadra.endereco ||
            ""
        ).trim();

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "card quadra-dinamica";

    card.innerHTML = `
        <img
            src="${escaparHtml(imagem)}"
            alt="${escaparHtml(quadra.nome)}"
        >

        <div class="card-content">
            <div class="card-top">
                <h3>
                    ${escaparHtml(quadra.nome)}
                </h3>

                <span class="badge">
                    ${escaparHtml(quadra.modalidade)}
                </span>
            </div>

            <p>
                ${escaparHtml(local)}
            </p>

            <div class="card-footer">
                <strong>
                    ${formatarMoeda(quadra.preco_hora)}
                    / hora
                </strong>

                <button
                    class="btn-reservar"
                    type="button"
                    data-quadra-id="${escaparHtml(quadra.id)}"
                    data-quadra="${escaparHtml(quadra.nome)}"
                    data-modalidade="${escaparHtml(quadra.modalidade)}"
                    data-local="${escaparHtml(local)}"
                    data-preco="${escaparHtml(
                        formatarMoeda(
                            quadra.preco_hora
                        )
                    )} / hora"
                >
                    Reservar
                </button>
            </div>
        </div>
    `;

    const img =
        $("img", card);

    img?.addEventListener(
        "error",
        () => {
            img.src =
                "Assets/quadra1.jpg";
        },
        {
            once: true
        }
    );

    return card;
}

async function carregarQuadras() {
    if (
        !quadrasDestaqueLista
    ) {
        return;
    }

    quadrasDestaqueLista.innerHTML =
        "";

    try {
        const dados =
            await fetchJson(
                `api/listar_quadras.php?atualizacao=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        const quadras =
            Array.isArray(
                dados.quadras
            )
                ? dados.quadras
                : [];

        if (!quadras.length) {
            quadrasDestaqueLista.innerHTML = `
                <p class="lista-vazia">
                    Nenhuma quadra cadastrada.
                </p>
            `;

            return;
        }

        quadras
            .slice(0, 3)
            .forEach(
                quadra => {
                    quadrasDestaqueLista
                        .appendChild(
                            criarCardQuadra(
                                quadra
                            )
                        );
                }
            );
    } catch (erro) {
        console.error(
            "Erro ao carregar quadras:",
            erro
        );

        quadrasDestaqueLista.innerHTML = `
            <p class="reserva-message error">
                ${escaparHtml(erro.message)}
            </p>
        `;
    }
}


// ======================================================
// RESERVA
// ======================================================

const reservaModal =
    $("#reserva-modal");

const reservaOverlay =
    $("#reserva-overlay");

const reservaCloseButton =
    $("#reserva-close");

const reservaForm =
    $("#reserva-form");

const reservaMessage =
    $("#reserva-message");

const reservaQuadra =
    $("#reserva-quadra");

const reservaModalidade =
    $("#reserva-modalidade");

const reservaLocal =
    $("#reserva-local");

const reservaPreco =
    $("#reserva-preco");

const horarioButtons =
    $$(".horario-btn");

const reservaHorarioInput =
    $("#reserva-horario");

const horarioSelecionadoTexto =
    $("#horario-selecionado");

let quadraSelecionadaId =
    null;

function limparHorarioSelecionado() {
    if (
        reservaHorarioInput
    ) {
        reservaHorarioInput.value =
            "";
    }

    if (
        horarioSelecionadoTexto
    ) {
        horarioSelecionadoTexto.textContent =
            "Nenhum horário selecionado";
    }

    horarioButtons.forEach(
        button =>
            button.classList.remove(
                "horario-btn--selecionado"
            )
    );
}

function liberarTodosHorarios() {
    horarioButtons.forEach(
        button => {
            button.disabled =
                false;

            button.classList.remove(
                "horario-btn--indisponivel",
                "horario-btn--selecionado"
            );

            const status =
                $(
                    "small",
                    button
                );

            if (status) {
                status.textContent =
                    "Disponível";
            }
        }
    );

    limparHorarioSelecionado();
}

async function atualizarHorariosDisponiveis(
    dataSelecionada
) {
    liberarTodosHorarios();

    if (
        !quadraSelecionadaId ||
        !dataSelecionada
    ) {
        return;
    }

    try {
        const parametros =
            new URLSearchParams({
                quadra_id:
                    quadraSelecionadaId,

                data:
                    dataSelecionada
            });

        const dados =
            await fetchJson(
                `api/horarios_ocupados.php?${parametros.toString()}&atualizacao=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        const ocupados =
            Array.isArray(
                dados.horarios_ocupados
            )
                ? dados.horarios_ocupados
                : [];

        horarioButtons.forEach(
            button => {
                const ocupado =
                    ocupados.includes(
                        button.dataset.horario
                    );

                button.disabled =
                    ocupado;

                button.classList.toggle(
                    "horario-btn--indisponivel",
                    ocupado
                );

                const status =
                    $(
                        "small",
                        button
                    );

                if (status) {
                    status.textContent =
                        ocupado
                            ? "Ocupado"
                            : "Disponível";
                }
            }
        );
    } catch (erro) {
        console.error(
            "Erro ao consultar horários:",
            erro
        );

        mostrarMensagem(
            reservaMessage,
            erro.message,
            "error"
        );
    }
}

function openReservaModal(
    button
) {
    if (!reservaModal) {
        return;
    }

    quadraSelecionadaId =
        button.dataset.quadraId ||
        null;

    if (reservaQuadra) {
        reservaQuadra.textContent =
            button.dataset.quadra ||
            "";
    }

    if (reservaModalidade) {
        reservaModalidade.textContent =
            button.dataset.modalidade ||
            "";
    }

    if (reservaLocal) {
        reservaLocal.textContent =
            button.dataset.local ||
            "";
    }

    if (reservaPreco) {
        reservaPreco.textContent =
            button.dataset.preco ||
            "";
    }

    limparDataSelecionada();
    liberarTodosHorarios();

    const buscaData =
        buscaDataInput?.value ||
        "";

    if (reservaDataInput) {
        reservaDataInput.value =
            buscaData;
    }

    if (buscaData) {
        atualizarTextoDataSelecionada(
            buscaData
        );

        atualizarHorariosDisponiveis(
            buscaData
        );
    }

    mostrarMensagem(
        reservaMessage,
        ""
    );

    reservaModal.classList.remove(
        "modal--hidden"
    );

    setBodyScrollLocked(
        true
    );
}

function closeReservaModal() {
    if (!reservaModal) {
        return;
    }

    reservaModal.classList.add(
        "modal--hidden"
    );

    setBodyScrollLocked(
        false
    );

    limparHorarioSelecionado();
    limparDataSelecionada();

    mostrarMensagem(
        reservaMessage,
        ""
    );
}

reservaCloseButton?.addEventListener(
    "click",
    closeReservaModal
);

reservaOverlay?.addEventListener(
    "click",
    closeReservaModal
);

horarioButtons.forEach(
    button => {
        button.addEventListener(
            "click",
            () => {
                if (
                    button.disabled ||
                    !reservaHorarioInput
                ) {
                    return;
                }

                horarioButtons.forEach(
                    item =>
                        item.classList.remove(
                            "horario-btn--selecionado"
                        )
                );

                button.classList.add(
                    "horario-btn--selecionado"
                );

                reservaHorarioInput.value =
                    button.dataset.horario;

                if (
                    horarioSelecionadoTexto
                ) {
                    horarioSelecionadoTexto.innerHTML = `
                        Horário selecionado:
                        <strong>
                            ${escaparHtml(
                                button.dataset.horario
                            )}
                        </strong>
                    `;
                }
            }
        );
    }
);

dataButtons.forEach(
    button => {
        button.addEventListener(
            "click",
            () => {
                const data =
                    formatarDataInput(
                        obterDataComAcrescimo(
                            Number(
                                button.dataset.dias
                            )
                        )
                    );

                if (
                    reservaDataInput
                ) {
                    reservaDataInput.value =
                        data;
                }

                dataButtons.forEach(
                    item =>
                        item.classList.remove(
                            "data-btn--selecionada"
                        )
                );

                button.classList.add(
                    "data-btn--selecionada"
                );

                atualizarTextoDataSelecionada(
                    data
                );

                atualizarHorariosDisponiveis(
                    data
                );
            }
        );
    }
);

reservaDataInput?.addEventListener(
    "change",
    () => {
        const hoje =
            obterHojeLocalISO();

        if (
            reservaDataInput.value &&
            reservaDataInput.value <
            hoje
        ) {
            reservaDataInput.value =
                hoje;
        }

        limparDataSelecionada();

        atualizarTextoDataSelecionada(
            reservaDataInput.value
        );

        atualizarHorariosDisponiveis(
            reservaDataInput.value
        );
    }
);

buscaDataInput?.addEventListener(
    "change",
    () => {
        const hoje =
            obterHojeLocalISO();

        if (
            buscaDataInput.value &&
            buscaDataInput.value <
            hoje
        ) {
            buscaDataInput.value =
                hoje;
        }
    }
);

reservaForm?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const nome =
            $(
                "#reserva-nome"
            )?.value.trim() ||
            "";

        const telefone =
            $(
                "#reserva-telefone"
            )?.value.trim() ||
            "";

        const data =
            reservaDataInput?.value ||
            "";

        const horario =
            reservaHorarioInput?.value ||
            "";

        const duracao =
            $(
                "#reserva-duracao"
            )?.value ||
            "";

        const observacoes =
            $(
                "#reserva-observacoes"
            )?.value.trim() ||
            "";

        if (
            !nome ||
            !telefone ||
            !data ||
            !horario ||
            !duracao
        ) {
            mostrarMensagem(
                reservaMessage,
                "Preencha todos os campos obrigatórios.",
                "error"
            );

            return;
        }

        if (
            !quadraSelecionadaId
        ) {
            mostrarMensagem(
                reservaMessage,
                "Erro: nenhuma quadra selecionada.",
                "error"
            );

            return;
        }

        if (
            data <
            obterHojeLocalISO()
        ) {
            mostrarMensagem(
                reservaMessage,
                "Não é possível reservar uma data anterior ao dia atual.",
                "error"
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "quadra_id",
            quadraSelecionadaId
        );

        formData.append(
            "nome_cliente",
            nome
        );

        formData.append(
            "telefone",
            telefone
        );

        formData.append(
            "data_reserva",
            data
        );

        formData.append(
            "horario",
            horario
        );

        formData.append(
            "duracao",
            duracao
        );

        formData.append(
            "observacoes",
            observacoes
        );

        try {
            const dados =
                await fetchJson(
                    "api/reservar.php",
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );

            mostrarMensagem(
                reservaMessage,
                dados.mensagem ||
                "Reserva realizada com sucesso.",
                "success"
            );

            await atualizarHorariosDisponiveis(
                data
            );

            setTimeout(
                () => {
                    reservaForm.reset();
                    closeReservaModal();
                },
                1500
            );
        } catch (erro) {
            mostrarMensagem(
                reservaMessage,
                erro.message,
                "error"
            );
        }
    }
);

document.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                ".btn-reservar"
            );

        if (button) {
            openReservaModal(
                button
            );
        }
    }
);


// ======================================================
// CAMPEONATOS
// ======================================================

const campeonatosDestaqueLista =
    $(
        "#campeonatos-destaque-lista"
    );

const todosCampeonatosModal =
    $(
        "#todos-campeonatos-modal"
    );

const todosCampeonatosOverlay =
    $(
        "#todos-campeonatos-overlay"
    );

const todosCampeonatosCloseButton =
    $(
        "#todos-campeonatos-close"
    );

const verTodosCampeonatosButton =
    $(
        ".campeonatos-buttons .btn-secondary"
    );

const todosCampeonatosLista =
    $(
        "#todos-campeonatos-lista"
    );

const torneiosLista =
    $(
        "#torneios-lista"
    );

function formatarDataCampeonato(
    dataString,
    resumida = false
) {
    if (
        !dataString ||
        !/^\d{4}-\d{2}-\d{2}/.test(
            dataString
        )
    ) {
        return "-";
    }

    const [
        ano,
        mes,
        dia
    ] =
        dataString
            .slice(0, 10)
            .split("-")
            .map(Number);

    const data =
        new Date(
            ano,
            mes - 1,
            dia
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "-";
    }

    return data
        .toLocaleDateString(
            "pt-BR",
            resumida
                ? {
                    day: "2-digit",
                    month: "short"
                }
                : {
                    day: "2-digit",
                    month: "long"
                }
        )
        .replace(
            ".",
            ""
        );
}

function criarCardCampeonato(
    campeonato
) {
    const ocupadas =
        Number(
            campeonato.vagas_ocupadas ||
            0
        );

    const total =
        Number(
            campeonato.vagas_total ||
            0
        );

    const porcentagem =
        total > 0
            ? Math.min(
                (
                    ocupadas /
                    total
                ) * 100,
                100
            )
            : 0;

    const lotado =
        total > 0 &&
        ocupadas >= total;

    const imagem =
        String(
            campeonato.imagem ||
            ""
        ).trim() ||
        "Assets/quadra1.jpg";

    const localizacao =
        obterLocalizacaoCampeonato(
            campeonato
        );

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "card campeonato-dinamico";

    card.innerHTML = `
        <img
            src="${escaparHtml(imagem)}"
            alt="${escaparHtml(campeonato.nome)}"
        >

        <div class="card-content">
            <div class="card-top">
                <h3>
                    ${escaparHtml(campeonato.nome)}
                </h3>

                <span class="badge">
                    ${escaparHtml(campeonato.modalidade)}
                </span>
            </div>

            <div class="card-info">
                <p>
                    <strong>
                        Premiação:
                    </strong>

                    <span class="prize">
                        ${formatarMoeda(campeonato.premio)}
                    </span>
                </p>

                <p>
                    🗓
                    ${formatarDataCampeonato(
                        campeonato.data_inicio
                    )}
                    -
                    ${formatarDataCampeonato(
                        campeonato.data_fim
                    )}
                </p>

                <p>
                    📍
                    ${escaparHtml(localizacao)}
                </p>
            </div>

            <div class="vagas-info">
                <span>
                    ${ocupadas} de ${total} vagas
                </span>

                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        style="width: ${porcentagem}%"
                    ></div>
                </div>
            </div>

            <div class="card-footer">
                <button
                    class="btn-inscrever"
                    type="button"
                    data-campeonato-id="${escaparHtml(campeonato.id)}"
                    data-campeonato="${escaparHtml(campeonato.nome)}"
                    data-modalidade="${escaparHtml(campeonato.modalidade)}"
                    data-local="${escaparHtml(localizacao)}"
                    data-vagas="${ocupadas} de ${total} vagas"
                    ${lotado ? "disabled" : ""}
                >
                    ${
                        lotado
                            ? "Esgotado"
                            : "Inscrever-se"
                    }
                </button>
            </div>
        </div>
    `;

    const img =
        $("img", card);

    img?.addEventListener(
        "error",
        () => {
            img.src =
                "Assets/quadra1.jpg";
        },
        {
            once: true
        }
    );

    return card;
}

function criarLinhaCampeonato(
    campeonato
) {
    const ocupadas =
        Number(
            campeonato.vagas_ocupadas ||
            0
        );

    const total =
        Number(
            campeonato.vagas_total ||
            0
        );

    const lotado =
        total > 0 &&
        ocupadas >= total;

    const localizacao =
        obterLocalizacaoCampeonato(
            campeonato
        );

    const linha =
        document.createElement(
            "div"
        );

    linha.className =
        "torneios-row campeonato-dinamico";

    linha.innerHTML = `
        <div class="table-col">
            ${escaparHtml(campeonato.nome)}
        </div>

        <div class="table-col">
            <span class="badge">
                ${escaparHtml(campeonato.modalidade)}
            </span>
        </div>

        <div class="table-col">
            ${formatarDataCampeonato(
                campeonato.data_inicio,
                true
            )}
        </div>

        <div class="table-col">
            ${escaparHtml(localizacao)}
        </div>

        <div class="table-col">
            ${ocupadas} / ${total}
        </div>

        <div class="table-col">
            <button
                class="btn-table btn-inscrever"
                type="button"
                data-campeonato-id="${escaparHtml(campeonato.id)}"
                data-campeonato="${escaparHtml(campeonato.nome)}"
                data-modalidade="${escaparHtml(campeonato.modalidade)}"
                data-local="${escaparHtml(localizacao)}"
                data-vagas="${ocupadas} / ${total}"
                ${lotado ? "disabled" : ""}
            >
                ${
                    lotado
                        ? "Esgotado"
                        : "Inscrever-se"
                }
            </button>
        </div>
    `;

    return linha;
}

function limparListasCampeonatos() {
    if (
        campeonatosDestaqueLista
    ) {
        campeonatosDestaqueLista.innerHTML =
            "";
    }

    if (
        todosCampeonatosLista
    ) {
        todosCampeonatosLista.innerHTML =
            "";
    }

    torneiosLista
        ?.querySelectorAll(
            ".torneios-row"
        )
        .forEach(
            linha =>
                linha.remove()
        );
}

function mostrarMensagemCampeonatos(
    mensagem,
    erro = false
) {
    const classe =
        erro
            ? "reserva-message error"
            : "lista-vazia";

    const html = `
        <p class="${classe}">
            ${escaparHtml(mensagem)}
        </p>
    `;

    if (
        campeonatosDestaqueLista
    ) {
        campeonatosDestaqueLista.innerHTML =
            html;
    }

    if (
        todosCampeonatosLista
    ) {
        todosCampeonatosLista.innerHTML =
            html;
    }

    if (torneiosLista) {
        const linha =
            document.createElement(
                "div"
            );

        linha.className =
            "torneios-row";

        linha.innerHTML = `
            <div class="table-col">
                ${escaparHtml(mensagem)}
            </div>

            <div class="table-col">-</div>
            <div class="table-col">-</div>
            <div class="table-col">-</div>
            <div class="table-col">-</div>
            <div class="table-col">-</div>
        `;

        torneiosLista.appendChild(
            linha
        );
    }
}

async function carregarCampeonatos() {
    limparListasCampeonatos();

    try {
        const dados =
            await fetchJson(
                `api/listar_campeonatos.php?atualizacao=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        const campeonatos =
            Array.isArray(
                dados.campeonatos
            )
                ? dados.campeonatos
                : [];

        if (
            !campeonatos.length
        ) {
            mostrarMensagemCampeonatos(
                "Nenhum campeonato cadastrado."
            );

            return;
        }

        campeonatos
            .slice(0, 3)
            .forEach(
                campeonato => {
                    campeonatosDestaqueLista
                        ?.appendChild(
                            criarCardCampeonato(
                                campeonato
                            )
                        );
                }
            );

        campeonatos.forEach(
            campeonato => {
                todosCampeonatosLista
                    ?.appendChild(
                        criarCardCampeonato(
                            campeonato
                        )
                    );

                torneiosLista
                    ?.appendChild(
                        criarLinhaCampeonato(
                            campeonato
                        )
                    );
            }
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar campeonatos:",
            erro
        );

        mostrarMensagemCampeonatos(
            erro.message,
            true
        );
    }
}

function openTodosCampeonatosModal() {
    if (
        !todosCampeonatosModal
    ) {
        return;
    }

    carregarCampeonatos();

    todosCampeonatosModal.classList.remove(
        "modal--hidden"
    );

    setBodyScrollLocked(
        true
    );
}

function closeTodosCampeonatosModal() {
    if (
        !todosCampeonatosModal
    ) {
        return;
    }

    todosCampeonatosModal.classList.add(
        "modal--hidden"
    );

    setBodyScrollLocked(
        false
    );
}

verTodosCampeonatosButton?.addEventListener(
    "click",
    openTodosCampeonatosModal
);

todosCampeonatosCloseButton?.addEventListener(
    "click",
    closeTodosCampeonatosModal
);

todosCampeonatosOverlay?.addEventListener(
    "click",
    closeTodosCampeonatosModal
);


// ======================================================
// INSCRIÇÃO EM CAMPEONATO
// ======================================================

const inscricaoModal =
    $("#inscricao-modal");

const inscricaoOverlay =
    $("#inscricao-overlay");

const inscricaoCloseButton =
    $("#inscricao-close");

const inscricaoForm =
    $("#inscricao-form");

const inscricaoMessage =
    $("#inscricao-message");

const inscricaoCampeonato =
    $("#inscricao-campeonato");

const inscricaoModalidade =
    $("#inscricao-modalidade");

const inscricaoLocal =
    $("#inscricao-local");

const inscricaoVagas =
    $("#inscricao-vagas");

let campeonatoSelecionadoId =
    null;

let campeonatoSelecionadoNome =
    null;

function openInscricaoModal(
    button
) {
    if (!inscricaoModal) {
        return;
    }

    campeonatoSelecionadoId =
        button.dataset.campeonatoId ||
        null;

    campeonatoSelecionadoNome =
        button.dataset.campeonato ||
        null;

    if (
        inscricaoCampeonato
    ) {
        inscricaoCampeonato.textContent =
            campeonatoSelecionadoNome ||
            "Campeonato";
    }

    if (
        inscricaoModalidade
    ) {
        inscricaoModalidade.textContent =
            button.dataset.modalidade ||
            "-";
    }

    if (
        inscricaoLocal
    ) {
        inscricaoLocal.textContent =
            button.dataset.local ||
            "-";
    }

    if (
        inscricaoVagas
    ) {
        inscricaoVagas.textContent =
            button.dataset.vagas ||
            "-";
    }

    mostrarMensagem(
        inscricaoMessage,
        ""
    );

    inscricaoModal.classList.remove(
        "modal--hidden"
    );

    setBodyScrollLocked(
        true
    );
}

function closeInscricaoModal() {
    if (!inscricaoModal) {
        return;
    }

    inscricaoModal.classList.add(
        "modal--hidden"
    );

    setBodyScrollLocked(
        false
    );

    campeonatoSelecionadoId =
        null;

    campeonatoSelecionadoNome =
        null;

    mostrarMensagem(
        inscricaoMessage,
        ""
    );
}

inscricaoCloseButton?.addEventListener(
    "click",
    closeInscricaoModal
);

inscricaoOverlay?.addEventListener(
    "click",
    closeInscricaoModal
);

document.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                ".btn-inscrever"
            );

        if (
            button &&
            !button.disabled
        ) {
            openInscricaoModal(
                button
            );
        }
    }
);

inscricaoForm?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const nome =
            $(
                "#inscricao-nome"
            )?.value.trim() ||
            "";

        const telefone =
            $(
                "#inscricao-telefone"
            )?.value.trim() ||
            "";

        const email =
            $(
                "#inscricao-email"
            )?.value.trim() ||
            "";

        if (
            !campeonatoSelecionadoId
        ) {
            mostrarMensagem(
                inscricaoMessage,
                "Erro: nenhum campeonato selecionado.",
                "error"
            );

            return;
        }

        if (
            !nome ||
            !telefone ||
            !email
        ) {
            mostrarMensagem(
                inscricaoMessage,
                "Preencha todos os campos.",
                "error"
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "campeonato_id",
            campeonatoSelecionadoId
        );

        formData.append(
            "campeonato_nome",
            campeonatoSelecionadoNome ||
            ""
        );

        formData.append(
            "nome_responsavel",
            nome
        );

        formData.append(
            "telefone",
            telefone
        );

        formData.append(
            "email",
            email
        );

        try {
            const dados =
                await fetchJson(
                    "api/inscrever_campeonato.php",
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );

            mostrarMensagem(
                inscricaoMessage,
                dados.mensagem ||
                "Inscrição realizada com sucesso.",
                "success"
            );

            await carregarCampeonatos();

            setTimeout(
                () => {
                    inscricaoForm.reset();
                    closeInscricaoModal();
                },
                1500
            );
        } catch (erro) {
            mostrarMensagem(
                inscricaoMessage,
                erro.message,
                "error"
            );
        }
    }
);


// ======================================================
// CRIAR CAMPEONATO
// ======================================================

const criarCampeonatoModal =
    $(
        "#criar-campeonato-modal"
    );

const criarCampeonatoOverlay =
    $(
        "#criar-campeonato-overlay"
    );

const criarCampeonatoCloseButton =
    $(
        "#criar-campeonato-close"
    );

const criarCampeonatoButton =
    $(
        ".campeonatos-buttons .btn-primary"
    );

const criarCampeonatoForm =
    $(
        "#criar-campeonato-form"
    );

const criarCampeonatoMessage =
    $(
        "#criar-campeonato-message"
    );

const criarDataInicioInput =
    $(
        "#criar-campeonato-data-inicio"
    );

const criarDataFimInput =
    $(
        "#criar-campeonato-data-fim"
    );

function configurarDatasCampeonato() {
    const hoje =
        obterHojeLocalISO();

    if (
        criarDataInicioInput
    ) {
        criarDataInicioInput.min =
            hoje;

        if (
            criarDataInicioInput.value &&
            criarDataInicioInput.value <
            hoje
        ) {
            criarDataInicioInput.value =
                "";
        }
    }

    if (
        criarDataFimInput
    ) {
        const dataMinimaFim =
            criarDataInicioInput?.value ||
            hoje;

        criarDataFimInput.min =
            dataMinimaFim;

        if (
            criarDataFimInput.value &&
            criarDataFimInput.value <
            dataMinimaFim
        ) {
            criarDataFimInput.value =
                "";
        }
    }
}

criarDataInicioInput?.addEventListener(
    "focus",
    configurarDatasCampeonato
);

criarDataInicioInput?.addEventListener(
    "click",
    configurarDatasCampeonato
);

criarDataFimInput?.addEventListener(
    "focus",
    configurarDatasCampeonato
);

criarDataFimInput?.addEventListener(
    "click",
    configurarDatasCampeonato
);

criarDataInicioInput?.addEventListener(
    "change",
    () => {
        const hoje =
            obterHojeLocalISO();

        if (
            criarDataInicioInput.value &&
            criarDataInicioInput.value <
            hoje
        ) {
            criarDataInicioInput.value =
                "";

            criarDataInicioInput
                .setCustomValidity(
                    "Não é possível selecionar uma data anterior ao dia atual."
                );

            criarDataInicioInput
                .reportValidity();

            criarDataInicioInput
                .setCustomValidity(
                    ""
                );

            return;
        }

        if (
            criarDataFimInput
        ) {
            criarDataFimInput.min =
                criarDataInicioInput.value ||
                hoje;

            if (
                criarDataFimInput.value &&
                criarDataFimInput.value <
                criarDataFimInput.min
            ) {
                criarDataFimInput.value =
                    "";
            }
        }
    }
);

criarDataFimInput?.addEventListener(
    "change",
    () => {
        const minimo =
            criarDataInicioInput?.value ||
            obterHojeLocalISO();

        if (
            criarDataFimInput.value &&
            criarDataFimInput.value <
            minimo
        ) {
            criarDataFimInput.value =
                "";

            criarDataFimInput
                .setCustomValidity(
                    "A data de término não pode ser anterior à data de início."
                );

            criarDataFimInput
                .reportValidity();

            criarDataFimInput
                .setCustomValidity(
                    ""
                );
        }
    }
);

function openCriarCampeonatoModal() {
    if (
        !criarCampeonatoModal
    ) {
        return;
    }

    garantirCampoCidadeCampeonato();
    configurarDatasCampeonato();

    mostrarMensagem(
        criarCampeonatoMessage,
        ""
    );

    criarCampeonatoModal.classList.remove(
        "modal--hidden"
    );

    setBodyScrollLocked(
        true
    );
}

function closeCriarCampeonatoModal() {
    if (
        !criarCampeonatoModal
    ) {
        return;
    }

    criarCampeonatoModal.classList.add(
        "modal--hidden"
    );

    setBodyScrollLocked(
        false
    );
}

criarCampeonatoButton?.addEventListener(
    "click",
    openCriarCampeonatoModal
);

criarCampeonatoCloseButton?.addEventListener(
    "click",
    closeCriarCampeonatoModal
);

criarCampeonatoOverlay?.addEventListener(
    "click",
    closeCriarCampeonatoModal
);

criarCampeonatoForm?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const nome =
            $(
                "#criar-campeonato-nome"
            )?.value.trim() ||
            "";

        const modalidade =
            $(
                "#criar-campeonato-modalidade"
            )?.value.trim() ||
            "";

        const local =
            $(
                "#criar-campeonato-local"
            )?.value.trim() ||
            "";

        const cidade =
            garantirCampoCidadeCampeonato()
                ?.value.trim() ||
            "";

        const dataInicio =
            criarDataInicioInput?.value ||
            "";

        const dataFim =
            criarDataFimInput?.value ||
            "";

        const premioDigitado =
            $(
                "#criar-campeonato-premiacao"
            )?.value.trim() ||
            "";

        const vagas =
            $(
                "#criar-campeonato-vagas"
            )?.value.trim() ||
            "";

        const imagem =
            $(
                "#criar-campeonato-imagem"
            )?.files?.[0] ||
            null;

        const hoje =
            obterHojeLocalISO();

        if (
            !nome ||
            !modalidade ||
            !local ||
            !cidade ||
            !dataInicio ||
            !dataFim ||
            !premioDigitado ||
            !vagas
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "Preencha todos os campos obrigatórios.",
                "error"
            );

            return;
        }

        if (
            !CIDADES_CAMPEONATO.includes(
                cidade
            )
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "Selecione uma cidade válida.",
                "error"
            );

            return;
        }

        if (
            dataInicio <
            hoje
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "A data de início não pode ser anterior ao dia atual.",
                "error"
            );

            return;
        }

        if (
            dataFim <
            dataInicio
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "A data de término não pode ser anterior à data de início.",
                "error"
            );

            return;
        }

        const numeroVagas =
            Number(vagas);

        if (
            !Number.isInteger(
                numeroVagas
            ) ||
            numeroVagas < 2
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "O número de vagas deve ser um número inteiro maior ou igual a 2.",
                "error"
            );

            return;
        }

        const premioNumero =
            converterMoedaParaNumero(
                premioDigitado
            );

        if (
            premioNumero === null ||
            premioNumero < 0
        ) {
            mostrarMensagem(
                criarCampeonatoMessage,
                "Digite uma premiação válida. Exemplo: R$ 2.000,00.",
                "error"
            );

            return;
        }

        if (imagem) {
            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            const tamanhoMaximo =
                5 * 1024 * 1024;

            if (
                !tiposPermitidos.includes(
                    imagem.type
                )
            ) {
                mostrarMensagem(
                    criarCampeonatoMessage,
                    "A imagem deve estar no formato JPG, PNG ou WEBP.",
                    "error"
                );

                return;
            }

            if (
                imagem.size >
                tamanhoMaximo
            ) {
                mostrarMensagem(
                    criarCampeonatoMessage,
                    "A imagem deve ter no máximo 5 MB.",
                    "error"
                );

                return;
            }
        }

        const localizacao =
            `${local} - ${cidade}`;

        const formData =
            new FormData();

        formData.append(
            "nome",
            nome
        );

        formData.append(
            "modalidade",
            modalidade
        );

        formData.append(
            "local",
            local
        );

        formData.append(
            "cidade",
            cidade
        );

        formData.append(
            "localizacao",
            localizacao
        );

        formData.append(
            "data_inicio",
            dataInicio
        );

        formData.append(
            "data_fim",
            dataFim
        );

        formData.append(
            "premio",
            premioNumero.toFixed(
                2
            )
        );

        formData.append(
            "vagas_total",
            String(
                numeroVagas
            )
        );

        if (imagem) {
            formData.append(
                "imagem",
                imagem
            );
        }

        try {
            const dados =
                await fetchJson(
                    "api/criar_campeonato.php",
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );

            mostrarMensagem(
                criarCampeonatoMessage,
                dados.mensagem ||
                "Campeonato criado com sucesso.",
                "success"
            );

            await carregarCampeonatos();

            setTimeout(
                () => {
                    criarCampeonatoForm.reset();

                    configurarDatasCampeonato();

                    closeCriarCampeonatoModal();
                },
                1500
            );
        } catch (erro) {
            mostrarMensagem(
                criarCampeonatoMessage,
                erro.message,
                "error"
            );
        }
    }
);


// ======================================================
// CADASTRO, LOGIN E CONTATO
// ======================================================

async function enviarFormulario(
    url,
    form
) {
    try {
        const dados =
            await fetchJson(
                url,
                {
                    method:
                        "POST",

                    body:
                        new FormData(
                            form
                        )
                }
            );

        alert(
            dados.mensagem ||
            "Operação realizada com sucesso."
        );

        if (
            dados.status ===
            "sucesso"
        ) {
            form.reset();
        }

        return dados;
    } catch (erro) {
        alert(
            erro.message ||
            "Erro ao conectar com o servidor."
        );

        return null;
    }
}

$(
    "#register-form"
)?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        await enviarFormulario(
            "api/cadastrar.php",
            event.currentTarget
        );
    }
);

$(
    "#login-form"
)?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const dados =
            await enviarFormulario(
                "api/login.php",
                event.currentTarget
            );

        if (
            dados?.status ===
            "sucesso"
        ) {
            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    dados.usuario
                )
            );
        }
    }
);

$(
    "#contato-form"
)?.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        await enviarFormulario(
            "api/contato.php",
            event.currentTarget
        );
    }
);


// ======================================================
// FECHAR MODAIS COM ESC
// ======================================================

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        if (
            authModal &&
            !authModal.classList.contains(
                "modal--hidden"
            )
        ) {
            closeAuthModal();
        }

        if (
            reservaModal &&
            !reservaModal.classList.contains(
                "modal--hidden"
            )
        ) {
            closeReservaModal();
        }

        if (
            todosCampeonatosModal &&
            !todosCampeonatosModal.classList.contains(
                "modal--hidden"
            )
        ) {
            closeTodosCampeonatosModal();
        }

        if (
            inscricaoModal &&
            !inscricaoModal.classList.contains(
                "modal--hidden"
            )
        ) {
            closeInscricaoModal();
        }

        if (
            criarCampeonatoModal &&
            !criarCampeonatoModal.classList.contains(
                "modal--hidden"
            )
        ) {
            closeCriarCampeonatoModal();
        }

        setBodyScrollLocked(
            false
        );
    }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

garantirCampoCidadeCampeonato();
configurarDatasMinimas();
preencherDatasRapidas();
configurarDatasCampeonato();
carregarQuadras();
carregarCampeonatos();