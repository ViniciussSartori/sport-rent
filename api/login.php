<?php
header("Content-Type: application/json");
require_once "conexao.php";

$email = $_POST["email"] ?? "";
$senha = $_POST["password"] ?? "";

if ($email == "" || $senha == "") {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha e-mail e senha."
    ]);
    exit;
}

$sql = "SELECT * FROM usuarios WHERE email = :email";
$stmt = $pdo->prepare($sql);
$stmt->execute([":email" => $email]);

$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario && password_verify($senha, $usuario["senha"])) {
    echo json_encode([
        "status" => "sucesso",
        "mensagem" => "Login realizado com sucesso!",
        "usuario" => [
            "id" => $usuario["id"],
            "nome" => $usuario["nome"],
            "email" => $usuario["email"]
        ]
    ]);
} else {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "E-mail ou senha incorretos."
    ]);
}
?>