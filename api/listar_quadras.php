<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

try {
    $sql = "
        SELECT
            id,
            nome,
            modalidade,
            cidade,
            estado,
            endereco,
            preco_hora,
            imagem,
            status,
            CONCAT_WS(
                ' - ',
                NULLIF(cidade, ''),
                NULLIF(estado, '')
            ) AS localizacao
        FROM quadras
        ORDER BY id DESC
    ";

    $stmt = $pdo->query($sql);

    $quadras = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );

    echo json_encode([
        "status" => "sucesso",
        "quadras" => $quadras
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $erro) {
    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao listar quadras."
    ], JSON_UNESCAPED_UNICODE);
}