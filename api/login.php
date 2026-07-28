<?php

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Método não permitido."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$email = trim($_POST["email"] ?? "");
$senha = $_POST["password"] ?? "";

if ($email === "" || $senha === "") {
    http_response_code(400);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha e-mail e senha."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$sql = "
    SELECT id, nome, email, senha
    FROM usuarios
    WHERE email = :email
    LIMIT 1
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":email" => $email
]);

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
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

http_response_code(401);

echo json_encode([
    "status" => "erro",
    "mensagem" => "E-mail ou senha incorretos."
], JSON_UNESCAPED_UNICODE);