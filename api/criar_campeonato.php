<?php

declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

date_default_timezone_set("America/Sao_Paulo");

function responderErro(
    string $mensagem,
    int $codigo = 400
): void {
    http_response_code($codigo);

    echo json_encode(
        [
            "status" => "erro",
            "mensagem" => $mensagem
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function responderSucesso(array $dados): void
{
    http_response_code(200);

    echo json_encode(
        $dados,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function validarData(string $data): bool
{
    $objetoData = DateTime::createFromFormat(
        "Y-m-d",
        $data
    );

    return (
        $objetoData !== false &&
        $objetoData->format("Y-m-d") === $data
    );
}

function converterPremio(string $valor): ?float
{
    $valor = trim($valor);

    if ($valor === "") {
        return null;
    }

    $valor = preg_replace(
        "/[^0-9,.-]/",
        "",
        $valor
    );

    if (
        $valor === null ||
        $valor === "" ||
        $valor === "-" ||
        $valor === "." ||
        $valor === ","
    ) {
        return null;
    }

    /*
     * Exemplos aceitos:
     *
     * R$ 2.000,00
     * 2.000,00
     * 2000,00
     * 2000.00
     * 2000
     */

    if (strpos($valor, ",") !== false) {
        $valor = str_replace(
            ".",
            "",
            $valor
        );

        $valor = str_replace(
            ",",
            ".",
            $valor
        );
    } elseif (
        preg_match(
            "/^[0-9]{1,3}(\.[0-9]{3})+$/",
            $valor
        )
    ) {
        $valor = str_replace(
            ".",
            "",
            $valor
        );
    }

    if (!is_numeric($valor)) {
        return null;
    }

    $numero = (float) $valor;

    if (!is_finite($numero)) {
        return null;
    }

    return $numero;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responderErro(
        "Método não permitido.",
        405
    );
}

/*
 * Dados principais
 */

$nome = trim(
    $_POST["nome"] ?? ""
);

$modalidade = trim(
    $_POST["modalidade"] ?? ""
);

$localizacaoRecebida = trim(
    $_POST["localizacao"] ?? ""
);

$local = trim(
    $_POST["local"] ?? ""
);

$cidade = trim(
    $_POST["cidade"] ?? ""
);

$dataInicio = trim(
    $_POST["data_inicio"] ?? ""
);

$dataFim = trim(
    $_POST["data_fim"] ?? ""
);

$premioTexto = trim(
    $_POST["premio"] ?? ""
);

$vagasRecebidas =
    $_POST["vagas_total"] ?? "";

/*
 * Compatibilidade:
 *
 * O JavaScript pode enviar:
 * localizacao = Ginásio Municipal - Monte Carmelo
 *
 * Ou o formulário pode enviar:
 * local = Ginásio Municipal
 * cidade = Monte Carmelo
 */

if ($localizacaoRecebida !== "") {
    $localizacao = $localizacaoRecebida;
} elseif (
    $local !== "" &&
    $cidade !== ""
) {
    $localizacao =
        $local . " - " . $cidade;
} else {
    $localizacao = "";
}

/*
 * Validação dos campos obrigatórios
 */

if (
    $nome === "" ||
    $modalidade === "" ||
    $localizacao === "" ||
    $dataInicio === "" ||
    $dataFim === "" ||
    $premioTexto === "" ||
    $vagasRecebidas === ""
) {
    responderErro(
        "Preencha todos os campos obrigatórios."
    );
}

/*
 * Validação do tamanho dos textos
 */

if (
    mb_strlen($nome) < 3 ||
    mb_strlen($nome) > 150
) {
    responderErro(
        "O nome do campeonato deve possuir entre 3 e 150 caracteres."
    );
}

if (
    mb_strlen($localizacao) < 3 ||
    mb_strlen($localizacao) > 255
) {
    responderErro(
        "Informe um local válido para o campeonato."
    );
}

/*
 * Modalidades permitidas
 */

$modalidadesPermitidas = [
    "Futebol",
    "Futebol society",
    "Futsal",
    "Vôlei",
    "Basquete",
    "Tênis"
];

if (
    !in_array(
        $modalidade,
        $modalidadesPermitidas,
        true
    )
) {
    responderErro(
        "Selecione uma modalidade válida."
    );
}

/*
 * Cidades permitidas
 *
 * A validação só acontece quando a cidade
 * for enviada separadamente pelo JavaScript.
 */

$cidadesPermitidas = [
    "Monte Carmelo",
    "Abadia dos Dourados",
    "Araguari",
    "Araxá",
    "Belo Horizonte",
    "Campina Verde",
    "Campos Altos",
    "Canápolis",
    "Carmo do Paranaíba",
    "Centralina",
    "Coromandel",
    "Estrela do Sul",
    "Frutal",
    "Guimarânia",
    "Indianópolis",
    "Iraí de Minas",
    "Ituiutaba",
    "João Pinheiro",
    "Lagoa Formosa",
    "Nova Ponte",
    "Patos de Minas",
    "Patrocínio",
    "Prata",
    "Rio Paranaíba",
    "Romaria",
    "Sacramento",
    "São Gotardo",
    "Tupaciguara",
    "Uberaba",
    "Uberlândia"
];

if (
    $cidade !== "" &&
    !in_array(
        $cidade,
        $cidadesPermitidas,
        true
    )
) {
    responderErro(
        "Selecione uma cidade válida."
    );
}

/*
 * Validação das datas
 */

if (
    !validarData($dataInicio) ||
    !validarData($dataFim)
) {
    responderErro(
        "Informe datas válidas."
    );
}

$hoje = date("Y-m-d");

if ($dataInicio < $hoje) {
    responderErro(
        "A data de início não pode ser anterior ao dia atual."
    );
}

if ($dataFim < $dataInicio) {
    responderErro(
        "A data de término não pode ser anterior à data de início."
    );
}

/*
 * Validação da premiação
 */

$premio = converterPremio(
    $premioTexto
);

if (
    $premio === null ||
    $premio < 0
) {
    responderErro(
        "Informe uma premiação válida."
    );
}

/*
 * Validação do número de vagas
 */

$vagasTotal = filter_var(
    $vagasRecebidas,
    FILTER_VALIDATE_INT,
    [
        "options" => [
            "min_range" => 2,
            "max_range" => 10000
        ]
    ]
);

if ($vagasTotal === false) {
    responderErro(
        "O número de vagas deve ser um número inteiro entre 2 e 10000."
    );
}

/*
 * Upload da imagem
 */

$caminhoImagem = null;
$arquivoSalvo = null;

try {
    if (
        isset($_FILES["imagem"]) &&
        $_FILES["imagem"]["error"] !== UPLOAD_ERR_NO_FILE
    ) {
        $erroUpload =
            $_FILES["imagem"]["error"];

        if ($erroUpload !== UPLOAD_ERR_OK) {
            switch ($erroUpload) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    responderErro(
                        "A imagem enviada é muito grande."
                    );

                case UPLOAD_ERR_PARTIAL:
                    responderErro(
                        "O envio da imagem foi interrompido."
                    );

                default:
                    responderErro(
                        "Não foi possível enviar a imagem."
                    );
            }
        }

        $tamanhoImagem =
            (int) $_FILES["imagem"]["size"];

        if ($tamanhoImagem <= 0) {
            responderErro(
                "A imagem enviada está vazia."
            );
        }

        if (
            $tamanhoImagem >
            5 * 1024 * 1024
        ) {
            responderErro(
                "A imagem deve possuir no máximo 5 MB."
            );
        }

        $arquivoTemporario =
            $_FILES["imagem"]["tmp_name"];

        if (
            !is_uploaded_file(
                $arquivoTemporario
            )
        ) {
            responderErro(
                "O arquivo enviado não é válido."
            );
        }

        $finfo = new finfo(
            FILEINFO_MIME_TYPE
        );

        $tipoArquivo = $finfo->file(
            $arquivoTemporario
        );

        $tiposPermitidos = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp"
        ];

        if (
            !isset(
                $tiposPermitidos[$tipoArquivo]
            )
        ) {
            responderErro(
                "Envie uma imagem JPG, PNG ou WEBP."
            );
        }

        $pastaDestino =
            __DIR__ .
            "/../Assets/campeonatos/";

        if (!is_dir($pastaDestino)) {
            $pastaCriada = mkdir(
                $pastaDestino,
                0775,
                true
            );

            if (!$pastaCriada) {
                responderErro(
                    "Não foi possível criar a pasta das imagens.",
                    500
                );
            }
        }

        if (!is_writable($pastaDestino)) {
            responderErro(
                "A pasta das imagens não possui permissão de escrita.",
                500
            );
        }

        $extensao =
            $tiposPermitidos[$tipoArquivo];

        $nomeArquivo =
            "campeonato_" .
            bin2hex(
                random_bytes(12)
            ) .
            "." .
            $extensao;

        $arquivoSalvo =
            $pastaDestino .
            $nomeArquivo;

        if (
            !move_uploaded_file(
                $arquivoTemporario,
                $arquivoSalvo
            )
        ) {
            responderErro(
                "Não foi possível salvar a imagem.",
                500
            );
        }

        $caminhoImagem =
            "Assets/campeonatos/" .
            $nomeArquivo;
    }

    /*
     * Cadastro no banco
     *
     * A cidade continua armazenada junto
     * ao campo localizacao.
     */

    $sql = "
        INSERT INTO campeonatos (
            nome,
            modalidade,
            localizacao,
            data_inicio,
            data_fim,
            premio,
            vagas_total,
            imagem
        ) VALUES (
            :nome,
            :modalidade,
            :localizacao,
            :data_inicio,
            :data_fim,
            :premio,
            :vagas_total,
            :imagem
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(
        ":nome",
        $nome,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ":modalidade",
        $modalidade,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ":localizacao",
        $localizacao,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ":data_inicio",
        $dataInicio,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ":data_fim",
        $dataFim,
        PDO::PARAM_STR
    );

    $stmt->bindValue(
        ":premio",
        $premio
    );

    $stmt->bindValue(
        ":vagas_total",
        $vagasTotal,
        PDO::PARAM_INT
    );

    if ($caminhoImagem === null) {
        $stmt->bindValue(
            ":imagem",
            null,
            PDO::PARAM_NULL
        );
    } else {
        $stmt->bindValue(
            ":imagem",
            $caminhoImagem,
            PDO::PARAM_STR
        );
    }

    $stmt->execute();

    responderSucesso([
        "status" => "sucesso",
        "mensagem" =>
            "Campeonato criado com sucesso!",
        "campeonato_id" =>
            $pdo->lastInsertId(),
        "localizacao" =>
            $localizacao
    ]);

} catch (Throwable $erro) {
    if (
        $arquivoSalvo !== null &&
        file_exists($arquivoSalvo)
    ) {
        unlink($arquivoSalvo);
    }

    error_log(
        "Erro ao criar campeonato: " .
        $erro->getMessage()
    );

    responderErro(
        "Erro ao criar campeonato.",
        500
    );
}