<?php
header("Content-Type: application/json");
require_once "conexao.php";

$usuario_id = null;
$quadra_id = $_POST["quadra_id"] ?? "";
$nome_cliente = $_POST["nome_cliente"] ?? "";
$telefone = $_POST["telefone"] ?? "";
$data_reserva = $_POST["data_reserva"] ?? "";
$horario = $_POST["horario"] ?? "";
$duracao = $_POST["duracao"] ?? "";
$observacoes = $_POST["observacoes"] ?? "";

if ($quadra_id == "" || $nome_cliente == "" || $telefone == "" || $data_reserva == "" || $horario == "" || $duracao == "") {
    echo json_encode([
        "status" => "erro",
        "mensagem" => "Preencha todos os campos obrigatórios."
    ]);
    exit;
}

$sql = "INSERT INTO reservas 
        (usuario_id, quadra_id, nome_cliente, telefone, data_reserva, horario, duracao, observacoes)
        VALUES
        (:usuario_id, :quadra_id, :nome_cliente, :telefone, :data_reserva, :horario, :duracao, :observacoes)";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":usuario_id" => $usuario_id,
    ":quadra_id" => $quadra_id,
    ":nome_cliente" => $nome_cliente,
    ":telefone" => $telefone,
    ":data_reserva" => $data_reserva,
    ":horario" => $horario,
    ":duracao" => $duracao,
    ":observacoes" => $observacoes
]);

echo json_encode([
    "status" => "sucesso",
    "mensagem" => "Reserva realizada com sucesso!"
]);
?>