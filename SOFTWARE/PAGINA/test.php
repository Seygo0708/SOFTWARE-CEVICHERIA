<?php
$conn = new mysqli("localhost", "root", "", "db_cevicheria");
if ($conn->connect_error) die("Error de conexión: " . $conn->connect_error);
echo "✅ Conexión exitosa a la base de datos!";
$result = $conn->query("SHOW TABLES LIKE 'cliente'");
echo $result->num_rows > 0 ? "✅ Tabla 'cliente' existe" : "❌ Tabla 'cliente' NO existe";
?>