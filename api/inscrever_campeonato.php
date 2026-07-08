<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexao.php";

$campeonato_nome = trim($_POST["campeonato_nome"] ?? "");
$nome_responsavel = trim($_POST["nome_responsavel"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$email = trim($_POST["email"] ?? "");

if (
    $campeonato_nome == "" ||
    $nome_responsavel == "" ||
    $telefone == "" ||
    $email == ""
) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha todos os campos."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Digite um e-mail válido."
    ]);
    exit;
}

try {
    $sqlCampeonato = "SELECT id FROM campeonatos WHERE nome = :nome LIMIT 1";
    $stmtCampeonato = $pdo->prepare($sqlCampeonato);
    $stmtCampeonato->execute([
        ":nome" => $campeonato_nome
    ]);

    $campeonato = $stmtCampeonato->fetch(PDO::FETCH_ASSOC);

    if (!$campeonato) {
        echo json_encode([
            "status" => "erro",
            "mensagem" => "Campeonato não encontrado no banco."
        ]);
        exit;
    }

    $campeonato_id = $campeonato["id"];

    $sqlVerificar = "SELECT id FROM inscricoes_campeonato
                     WHERE campeonato_id = :campeonato_id
                     AND email = :email
                     LIMIT 1";

    $stmtVerificar = $pdo->prepare($sqlVerificar);
    $stmtVerificar->execute([
        ":campeonato_id" => $campeonato_id,
        ":email" => $email
    ]);

    if ($stmtVerificar->fetch()) {
        echo json_encode([
            "status" => "erro",
            "mensagem" => "Esse e-mail já está inscrito neste campeonato."
        ]);
        exit;
    }

    $sql = "INSERT INTO inscricoes_campeonato
            (campeonato_id, usuario_id, nome_time, nome_responsavel, telefone, email)
            VALUES
            (:campeonato_id, NULL, NULL, :nome_responsavel, :telefone, :email)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":campeonato_id" => $campeonato_id,
        ":nome_responsavel" => $nome_responsavel,
        ":telefone" => $telefone,
        ":email" => $email
    ]);

    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Inscrição realizada com sucesso!"
    ]);
} catch (PDOException $erro) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao realizar inscrição: " . $erro->getMessage()
    ]);
}
?>