<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexao.php";

$nome = trim($_POST["nome"] ?? "");
$modalidade = trim($_POST["modalidade"] ?? "");
$localizacao = trim($_POST["localizacao"] ?? "");
$data_inicio = $_POST["data_inicio"] ?? "";
$data_fim = $_POST["data_fim"] ?? "";
$premio = trim($_POST["premio"] ?? "");
$vagas_total = $_POST["vagas_total"] ?? "";

if (
    $nome == "" ||
    $modalidade == "" ||
    $localizacao == "" ||
    $data_inicio == "" ||
    $data_fim == "" ||
    $premio == "" ||
    $vagas_total == ""
) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha todos os campos."
    ]);
    exit;
}

if (!is_numeric($vagas_total) || $vagas_total < 2) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "O número de vagas deve ser maior ou igual a 2."
    ]);
    exit;
}

try {
    $sqlVerificar = "SELECT id FROM campeonatos WHERE nome = :nome LIMIT 1";
    $stmtVerificar = $pdo->prepare($sqlVerificar);
    $stmtVerificar->execute([
        ":nome" => $nome
    ]);

    if ($stmtVerificar->fetch()) {
        echo json_encode([
            "status" => "erro",
            "mensagem" => "Já existe um campeonato com esse nome."
        ]);
        exit;
    }

    $sql = "INSERT INTO campeonatos
            (nome, modalidade, data_inicio, data_fim, localizacao, premio, vagas_total, imagem)
            VALUES
            (:nome, :modalidade, :data_inicio, :data_fim, :localizacao, :premio, :vagas_total, NULL)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":nome" => $nome,
        ":modalidade" => $modalidade,
        ":data_inicio" => $data_inicio,
        ":data_fim" => $data_fim,
        ":localizacao" => $localizacao,
        ":premio" => $premio,
        ":vagas_total" => $vagas_total
    ]);

    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Campeonato criado com sucesso!"
    ]);
} catch (PDOException $erro) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao criar campeonato: " . $erro->getMessage()
    ]);
}
?>