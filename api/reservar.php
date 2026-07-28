<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

date_default_timezone_set("America/Sao_Paulo");

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

$quadraId = filter_input(
    INPUT_POST,
    "quadra_id",
    FILTER_VALIDATE_INT
);

$nomeCliente = trim($_POST["nome_cliente"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$dataReserva = trim($_POST["data_reserva"] ?? "");
$horario = substr(trim($_POST["horario"] ?? ""), 0, 5);
$duracao = (int) ($_POST["duracao"] ?? 0);
$observacoes = trim($_POST["observacoes"] ?? "");

if (
    !$quadraId ||
    $nomeCliente === "" ||
    $telefone === "" ||
    $dataReserva === "" ||
    $horario === "" ||
    $duracao <= 0
) {
    responderErro("Preencha todos os campos obrigatórios.");
}

if ($dataReserva < date("Y-m-d")) {
    responderErro(
        "Não é possível reservar uma quadra em uma data passada."
    );
}

$inicioNovo = strtotime(
    $dataReserva . " " . $horario
);

if ($inicioNovo === false) {
    responderErro("Data ou horário inválido.");
}

$fimNovo = $inicioNovo + ($duracao * 3600);

try {
    $pdo->beginTransaction();

    $sqlConflitos = "
        SELECT
            id,
            TIME_FORMAT(horario, '%H:%i') AS horario,
            duracao
        FROM reservas
        WHERE quadra_id = :quadra_id
          AND data_reserva = :data_reserva
          AND LOWER(status) <> 'cancelada'
        FOR UPDATE
    ";

    $stmtConflitos = $pdo->prepare($sqlConflitos);

    $stmtConflitos->execute([
        ":quadra_id" => $quadraId,
        ":data_reserva" => $dataReserva
    ]);

    $reservasExistentes =
        $stmtConflitos->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reservasExistentes as $reserva) {
        $inicioExistente = strtotime(
            $dataReserva .
            " " .
            substr($reserva["horario"], 0, 5)
        );

        $duracaoExistente =
            max(1, (int) $reserva["duracao"]);

        $fimExistente =
            $inicioExistente +
            ($duracaoExistente * 3600);

        $existeSobreposicao =
            $inicioNovo < $fimExistente &&
            $fimNovo > $inicioExistente;

        if ($existeSobreposicao) {
            responderErro(
                "Esse horário já está ocupado para a data selecionada."
            );
        }
    }

    $sqlInserir = "
        INSERT INTO reservas (
            quadra_id,
            nome_cliente,
            telefone,
            data_reserva,
            horario,
            duracao,
            observacoes,
            status
        ) VALUES (
            :quadra_id,
            :nome_cliente,
            :telefone,
            :data_reserva,
            :horario,
            :duracao,
            :observacoes,
            'confirmada'
        )
    ";

    $stmtInserir = $pdo->prepare($sqlInserir);

    $stmtInserir->execute([
        ":quadra_id" => $quadraId,
        ":nome_cliente" => $nomeCliente,
        ":telefone" => $telefone,
        ":data_reserva" => $dataReserva,
        ":horario" => $horario,
        ":duracao" => $duracao,
        ":observacoes" => $observacoes
    ]);

    $pdo->commit();

    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Reserva realizada com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao realizar a reserva."
    ], JSON_UNESCAPED_UNICODE);
}