<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

try {
    $sql = "
        SELECT
            c.id,
            c.nome,
            c.modalidade,
            c.localizacao,
            c.data_inicio,
            c.data_fim,
            c.premio,
            c.vagas_total,
            c.imagem,
            COUNT(i.campeonato_id) AS vagas_ocupadas
        FROM campeonatos c

        LEFT JOIN inscricoes_campeonato i
            ON i.campeonato_id = c.id

        GROUP BY
            c.id,
            c.nome,
            c.modalidade,
            c.localizacao,
            c.data_inicio,
            c.data_fim,
            c.premio,
            c.vagas_total,
            c.imagem

        ORDER BY
            c.data_inicio ASC,
            c.id DESC
    ";

    $stmt = $pdo->query($sql);

    $campeonatos = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    echo json_encode([
        "status" => "sucesso",
        "campeonatos" => $campeonatos
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {
    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao listar campeonatos."
    ], JSON_UNESCAPED_UNICODE);
}