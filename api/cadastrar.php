<?php
header("Content-Type: application/json");
require_once "conexao.php";

$nome = $_POST["name"] ?? "";
$email = $_POST["email"] ?? "";
$senha = $_POST["password"] ?? "";
$confirmarSenha = $_POST["confirmPassword"] ?? "";

if ($nome == "" || $email == "" || $senha == "" || $confirmarSenha == "") {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha todos os campos."
    ]);
    exit;
}

if ($senha !== $confirmarSenha) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "As senhas não coincidem."
    ]);
    exit;
}

$senhaCriptografada = password_hash($senha, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":nome" => $nome,
        ":email" => $email,
        ":senha" => $senhaCriptografada
    ]);

    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Usuário cadastrado com sucesso!"
    ]);
} catch (PDOException $erro) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao cadastrar. Talvez esse e-mail já exista."
    ]);
}
?>