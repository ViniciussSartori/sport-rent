<?php

header("Content-Type: application/json; charset=utf-8");

$host = "localhost";
$dbname = "sport_rent";
$user = "root";
$password = "mysql";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $erro) {
    http_response_code(500);

    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao conectar com o banco de dados."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}