<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

function responderErro(string $mensagem, int $codigo = 400): void
{
    if (isset($GLOBALS["pdo"]) &&
        $GLOBALS["pdo"]->inTransaction()) {

        $GLOBALS["pdo"]->rollBack();
    }

    http_response_code($codigo);

    echo json_encode([
        "status" => "erro",
        "mensagem" => $mensagem
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responderErro("Método não permitido.", 405);
}

$campeonatoId = filter_input(
    INPUT_POST,
    "campeonato_id",
    FILTER_VALIDATE_INT
);

$campeonatoNome = trim(
    $_POST["campeonato_nome"] ?? ""
);

$nomeResponsavel = trim(
    $_POST["nome_responsavel"] ?? ""
);

$telefone = trim($_POST["telefone"] ?? "");
$email = trim($_POST["email"] ?? "");

if (
    (!$campeonatoId && $campeonatoNome === "") ||
    $nomeResponsavel === "" ||
    $telefone === "" ||
    $email === ""
) {
    responderErro("Preencha todos os campos.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responderErro("Informe um e-mail válido.");
}

try {
    $pdo->beginTransaction();

    if ($campeonatoId) {
        $sqlCampeonato = "
            SELECT id, nome, vagas_total
            FROM campeonatos
            WHERE id = :campeonato
            LIMIT 1
            FOR UPDATE
        ";

        $parametroCampeonato = $campeonatoId;
    } else {
        $sqlCampeonato = "
            SELECT id, nome, vagas_total
            FROM campeonatos
            WHERE nome = :campeonato
            LIMIT 1
            FOR UPDATE
        ";

        $parametroCampeonato = $campeonatoNome;
    }

    $stmtCampeonato = $pdo->prepare($sqlCampeonato);

    $stmtCampeonato->execute([
        ":campeonato" => $parametroCampeonato
    ]);

    $campeonato =
        $stmtCampeonato->fetch(PDO::FETCH_ASSOC);

    if (!$campeonato) {
        responderErro("Campeonato não encontrado.");
    }

    $stmtQuantidade = $pdo->prepare("
        SELECT COUNT(*)
        FROM inscricoes_campeonato
        WHERE campeonato_id = :campeonato_id
    ");

    $stmtQuantidade->execute([
        ":campeonato_id" => $campeonato["id"]
    ]);

    $quantidadeInscritos =
        (int) $stmtQuantidade->fetchColumn();

    if (
        $quantidadeInscritos >=
        (int) $campeonato["vagas_total"]
    ) {
        responderErro(
            "Esse campeonato não possui mais vagas."
        );
    }

    $stmtDuplicada = $pdo->prepare("
        SELECT COUNT(*)
        FROM inscricoes_campeonato
        WHERE campeonato_id = :campeonato_id
          AND email = :email
    ");

    $stmtDuplicada->execute([
        ":campeonato_id" => $campeonato["id"],
        ":email" => $email
    ]);

    if ((int) $stmtDuplicada->fetchColumn() > 0) {
        responderErro(
            "Este e-mail já está inscrito neste campeonato."
        );
    }

    $stmtInserir = $pdo->prepare("
        INSERT INTO inscricoes_campeonato (
            campeonato_id,
            nome_responsavel,
            telefone,
            email
        ) VALUES (
            :campeonato_id,
            :nome_responsavel,
            :telefone,
            :email
        )
    ");

    $stmtInserir->execute([
        ":campeonato_id" => $campeonato["id"],
        ":nome_responsavel" => $nomeResponsavel,
        ":telefone" => $telefone,
        ":email" => $email
    ]);

    $pdo->commit();

    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Inscrição realizada com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao realizar a inscrição."
    ], JSON_UNESCAPED_UNICODE);
}