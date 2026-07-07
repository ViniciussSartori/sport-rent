<?php
$host = "localhost";
$dbname = "sport_rent";
$user = "root";
$password = "mysql";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $erro) {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Erro ao conectar com o banco: " . $erro->getMessage()
    ]);
    exit;
}
?>