<?php
// conexion.php
$host = "localhost";
$user = "root";
$pass = ""; 
$db   = "db_cevicheria";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// ESTA LÍNEA ES MÁGICA: Permite tildes y ñ sin romper el JSON
$conn->set_charset("utf8");
?>