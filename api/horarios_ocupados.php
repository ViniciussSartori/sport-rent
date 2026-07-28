<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

date_default_timezone_set("America/Sao_Paulo");

$quadraId = filter_input(
    INPUT_GET,
    "quadra_id",
    FILTER_VALIDATE_INT
);

$data = trim($_GET["data"] ?? "");

if (!$quadraId || $data === "") {
    http_response_code(400);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Quadra e data são obrigatórias."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    $sql = "
        SELECT
            TIME_FORMAT(horario, '%H:%i') AS horario,
            duracao
        FROM reservas
        WHERE quadra_id = :quadra_id
          AND data_reserva = :data_reserva
          AND LOWER(status) <> 'cancelada'
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":quadra_id" => $quadraId,
        ":data_reserva" => $data
    ]);

    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $horariosOcupados = [];

    foreach ($reservas as $reserva) {
        $duracao = max(1, (int) $reserva["duracao"]);

        $inicio = DateTime::createFromFormat(
            "H:i",
            substr($reserva["horario"], 0, 5)
        );

        if (!$inicio) {
            continue;
        }

        for ($hora = 0; $hora < $duracao; $hora++) {
            $horarioAtual = clone $inicio;

            if ($hora > 0) {
                $horarioAtual->modify("+{$hora} hour");
            }

            $horariosOcupados[] =
                $horarioAtual->format("H:i");
        }
    }

    $horariosOcupados = array_values(
        array_unique($horariosOcupados)
    );

    sort($horariosOcupados);

    echo json_encode([
        "status" => "sucesso",
        "horarios_ocupados" => $horariosOcupados
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {
    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao consultar horários."
    ], JSON_UNESCAPED_UNICODE);
}