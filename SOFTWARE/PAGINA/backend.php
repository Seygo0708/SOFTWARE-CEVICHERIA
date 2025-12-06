<?php
// backend.php limpio y directo

// Mostrar errores en desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {

        // ================= GUARDAR PEDIDO (cliente) =================
        case 'guardar_pedido':
            $body = file_get_contents('php://input');
            $data = json_decode($body, true);

            if (!$data || !isset($data['total'], $data['mesa'])) {
                echo json_encode(['success' => false, 'error' => 'Datos de pedido incompletos']);
                break;
            }

            $id_cliente  = isset($data['id_cliente']) ? intval($data['id_cliente']) : 1;
            $mesa        = $conn->real_escape_string($data['mesa']);
            $total       = floatval($data['total']);
            $metodo_pago = isset($data['metodo_pago']) ? $conn->real_escape_string($data['metodo_pago']) : 'Efectivo';
            $detalleJson = isset($data['productos']) ? $conn->real_escape_string(json_encode($data['productos'])) : '[]';

            // Requiere columnas: mesa, total, metodo_pago, detalle, estado, fecha
            $sql = "INSERT INTO pedido (id_cliente, mesa, total, metodo_pago, detalle, estado, fecha)
                    VALUES ($id_cliente, '$mesa', $total, '$metodo_pago', '$detalleJson', 'PENDIENTE', NOW())";

            if ($conn->query($sql)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => $conn->error]);
            }
            break;

        // ================= LISTAR PEDIDOS PENDIENTES (cajero) =================
        case 'get_pedidos':
            $rows = [];
            $sql  = "SELECT * FROM pedido WHERE estado='PENDIENTE' ORDER BY fecha DESC";
            if ($res = $conn->query($sql)) {
                while ($r = $res->fetch_assoc()) {
                    $rows[] = $r;
                }
            }
            echo json_encode($rows, JSON_UNESCAPED_UNICODE);
            break;

        // ================= LOGIN =================
        case 'login':
            $body = file_get_contents('php://input');
            $data = json_decode($body, true);

            if (!$data || !isset($data['username'], $data['password'])) {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
                break;
            }

            $user = $conn->real_escape_string($data['username']);
            $pass = $conn->real_escape_string($data['password']);

            // Login más flexible: no dependemos de la columna estado
            $sql  = "SELECT * FROM usuario WHERE username='$user' AND password='$pass' LIMIT 1";
            $res  = $conn->query($sql);

            if ($res && $res->num_rows > 0) {
                echo json_encode(['success' => true, 'user' => $res->fetch_assoc()], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
            }
            break;

        // ================= CLIENTES =================
        case 'get_clientes':
            $clientes = [];
            $sql = "SELECT * FROM cliente";
            if ($result = $conn->query($sql)) {
                while ($row = $result->fetch_assoc()) {
                    $clientes[] = $row;
                }
            }
            echo json_encode($clientes, JSON_UNESCAPED_UNICODE);
            break;

        // ================= USUARIOS =================
        case 'get_usuarios':
            $usuarios = [];
            $sql = "SELECT * FROM usuario";
            if ($result = $conn->query($sql)) {
                while ($row = $result->fetch_assoc()) {
                    $usuarios[] = $row;
                }
            }
            echo json_encode($usuarios, JSON_UNESCAPED_UNICODE);
            break;

        // ================= DASHBOARD =================
        case 'get_dashboard':
            $ventas_hoy     = 0;
            $pedidos_hoy    = 0;
            $total_clientes = 0;

            if ($r = $conn->query("SELECT SUM(total) AS t FROM venta WHERE DATE(fecha_venta) = CURDATE()")) {
                $row = $r->fetch_assoc();
                $ventas_hoy = $row['t'] ?: 0;
            }

            if ($r = $conn->query("SELECT COUNT(*) AS c FROM venta WHERE DATE(fecha_venta) = CURDATE()")) {
                $row = $r->fetch_assoc();
                $pedidos_hoy = $row['c'] ?: 0;
            }

            if ($r = $conn->query("SELECT COUNT(*) AS c FROM cliente")) {
                $row = $r->fetch_assoc();
                $total_clientes = $row['c'] ?: 0;
            }

            echo json_encode([
                'ventas_hoy'     => $ventas_hoy,
                'pedidos_hoy'    => $pedidos_hoy,
                'total_clientes' => $total_clientes,
            ]);
            break;

        // ================= PRODUCTOS =================
        case 'get_productos':
            $productos = [];
            $sql = "SELECT * FROM producto WHERE estado='Activo'";
            if ($result = $conn->query($sql)) {
                while ($row = $result->fetch_assoc()) {
                    $productos[] = $row;
                }
            }
            echo json_encode($productos, JSON_UNESCAPED_UNICODE);
            break;

        // ================= GUARDAR VENTA (cajero) =================
        case 'guardar_venta':
            $body = file_get_contents('php://input');
            $data = json_decode($body, true);

            if (!$data || !isset($data['total'], $data['productos'])) {
                echo json_encode(['success' => false, 'error' => 'Datos de venta incompletos']);
                break;
            }

            $total     = floatval($data['total']);
            $productos = $data['productos'];

            // Por ahora usamos cliente 1 y usuario 1 por defecto
            $id_cliente = 1;
            $id_usuario = 1;

            $conn->begin_transaction();

            try {
                $sqlVenta   = "INSERT INTO venta (id_cliente, id_usuario, total, fecha_venta) VALUES (?, ?, ?, NOW())";
                $stmtVenta  = $conn->prepare($sqlVenta);
                $stmtVenta->bind_param('iid', $id_cliente, $id_usuario, $total);
                $stmtVenta->execute();
                $idVenta = $stmtVenta->insert_id;

                $sqlDet = "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
                           VALUES (?, ?, ?, ?, ?)";
                $stmtDet = $conn->prepare($sqlDet);

                foreach ($productos as $p) {
                    $id_producto = intval($p['id']);
                    $precio      = floatval($p['precio']);
                    $cantidad    = isset($p['cantidad']) ? intval($p['cantidad']) : 1;
                    $subtotal    = $precio * $cantidad;

                    $stmtDet->bind_param('iiidd', $idVenta, $id_producto, $cantidad, $precio, $subtotal);
                    $stmtDet->execute();
                }

                $conn->commit();
                echo json_encode(['success' => true, 'id_venta' => $idVenta]);
            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(['success' => false, 'error' => 'Error al guardar la venta: ' . $e->getMessage()]);
            }
            break;

        // ================= DEFAULT =================
        default:
            echo json_encode(['error' => 'Accion no valida']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}