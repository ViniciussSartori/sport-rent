<?php
header("Content-Type: application/json");
require_once "conexao.php";

$nome = $_POST["nome"] ?? "";
$email = $_POST["email"] ?? "";
$assunto = $_POST["assunto"] ?? "";
$mensagem = $_POST["mensagem"] ?? "";

if ($nome == "" || $email == "" || $assunto == "" || $mensagem == "") {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha todos os campos."
    ]);
    exit;
}

$sql = "INSERT INTO contatos (nome, email, assunto, mensagem)
        VALUES (:nome, :email, :assunto, :mensagem)";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":nome" => $nome,
    ":email" => $email,
    ":assunto" => $assunto,
    ":mensagem" => $mensagem
]);

echo json_encode([
    "status" => "sucesso",
    "mensagem" => "Mensagem enviada com sucesso!"
]);
?>