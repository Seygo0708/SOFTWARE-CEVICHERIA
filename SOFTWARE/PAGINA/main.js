document.addEventListener('DOMContentLoaded', function() {
    
    // --- VARIABLES Y ELEMENTOS ---
    const loginSection = document.getElementById('loginSection');
    const wrapper = document.getElementById('wrapper');
    const loginForm = document.getElementById('loginForm');
    const contenidoPrincipal = document.getElementById('contenido-principal');
    const pageTitle = document.getElementById('pageTitle');
    const menuToggle = document.getElementById('menu-toggle');
    const wrapperDiv = document.getElementById('wrapper');
    const btnLogout = document.getElementById('btn-logout');

    // Carrito de ventas (POS)
    let carritoPOS = [];
    let metodoPago = 'Efectivo';
    let usuarioActual = null;
    let campanaInterval = null;

    // Ocultar dashboard al inicio
    if(wrapper) wrapper.style.display = 'none';
    if(document.getElementById('fecha-actual')){
        document.getElementById('fecha-actual').textContent =
            new Date().toLocaleDateString('es-PE',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // --- Campana de notificaciones (pedidos para cajero) ---
    function actualizarCampana() {
        const stored = sessionStorage.getItem('usuario_actual');
        const u = usuarioActual || (stored ? JSON.parse(stored) : null);
        const rol = (u && u.rol ? u.rol : '').toUpperCase();
        if (rol === 'CLIENTE') return; // solo cajero/admin

        fetch('backend.php?action=get_pedidos')
            .then(r => r.json())
            .then(pedidos => {
                const badge = document.getElementById('notif-count');
                if (!badge) return;
                const n = pedidos.length || 0;
                badge.textContent = n;
                badge.style.display = n > 0 ? 'inline-block' : 'none';
                const mesas = pedidos.map(p => p.mesa || 'SIN MESA');
                badge.title = n > 0 ? 'Mesas pendientes: ' + mesas.join(', ') : '';
            })
            .catch(() => {});
    }

    // --- 1. LOGIN ---
    if(loginForm){
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            fetch('backend.php?action=login', {
                method: 'POST',
                body: JSON.stringify({ username: user, password: pass }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                if(!response.ok) throw new Error("Error en la conexión con el servidor");
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    loginSection.style.display = 'none';
                    wrapper.style.display = 'flex';

                    sessionStorage.setItem('usuario_actual', JSON.stringify(data.user));
                    usuarioActual = data.user;

                    aplicarPermisos(data.user.rol || 'CAJERO');

                    if ((data.user.rol || '').toUpperCase() === 'CLIENTE') {
                        loadScreen('pos');
                    } else {
                        loadScreen('dashboard');
                        actualizarCampana();
                        if (campanaInterval) clearInterval(campanaInterval);
                        campanaInterval = setInterval(actualizarCampana, 5000);
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('No se pudo conectar con la base de datos.\n\nVerifica XAMPP y que entras por localhost.');
            });
        });
    }

    // --- Permisos por rol ---
    function aplicarPermisos(rol) {
        const r = (rol || '').toUpperCase();

        const elUsuarios   = document.getElementById('menu-usuarios');
        const elClientes   = document.getElementById('menu-clientes');
        const elProductos  = document.getElementById('menu-productos');
        const elVentas     = document.getElementById('menu-ventas');
        const elConfig     = document.getElementById('menu-config');

        if (r === 'CLIENTE') {
            if (elUsuarios)  elUsuarios.style.display = 'none';
            if (elClientes)  elClientes.style.display = 'none';
            if (elProductos) elProductos.style.display = 'none';
            if (elVentas)    elVentas.style.display = 'none';
            if (elConfig)    elConfig.style.display = 'none';
        } else {
            [elUsuarios, elClientes, elProductos, elVentas, elConfig].forEach(el => {
                if (el) {
                    el.style.display = '';
                    el.classList.remove('disabled');
                }
            });
        }
    }

    // --- 2. MENÚ LATERAL ---
    if(menuToggle){
        menuToggle.addEventListener('click', function() {
            wrapperDiv.classList.toggle('toggled');
        });
    }

    if(btnLogout){
        btnLogout.addEventListener('click', function() {
            wrapper.style.display = 'none';
            loginSection.style.display = 'flex';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            carritoPOS = [];
            usuarioActual = null;
            if (campanaInterval) {
                clearInterval(campanaInterval);
                campanaInterval = null;
            }
        });
    }

    const links = ['dashboard', 'pos', 'usuarios', 'clientes'];
    links.forEach(link => {
        const el = document.getElementById(`menu-${link}`);
        if(el) el.addEventListener('click', (e) => {
            e.preventDefault();
            loadScreen(link);
        });
    });

    // --- 3. CARGADOR DE PANTALLAS ---
    window.loadScreen = async function(screenName) {
        document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
        const activeLink = document.getElementById(`menu-${screenName}`);
        if(activeLink) activeLink.classList.add('active');
        
        contenidoPrincipal.style.opacity = '0';
        
        setTimeout(async () => {
            let htmlContent = '';

            try {
                switch(screenName) {
                    // DASHBOARD
                    case 'dashboard': {
                        pageTitle.textContent = 'Dashboard General';
                        const resDash = await fetch('backend.php?action=get_dashboard');
                        const dataDash = await resDash.json();
                        
                        htmlContent = `
                        <div class="row g-3">
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div><h5 class="text-muted fw-normal mt-0">Ventas Hoy</h5><h3 class="fw-bold">S/ ${parseFloat(dataDash.ventas_hoy || 0).toFixed(2)}</h3></div>
                                    <div class="p-3 bg-light rounded-circle"><i class="bi bi-cash-coin fs-1 text-success"></i></div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div><h5 class="text-muted fw-normal mt-0">Pedidos</h5><h3 class="fw-bold">${dataDash.pedidos_hoy || 0}</h3></div>
                                    <div class="p-3 bg-light rounded-circle"><i class="bi bi-basket fs-1 text-primary"></i></div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div><h5 class="text-muted fw-normal mt-0">Clientes</h5><h3 class="fw-bold">${dataDash.total_clientes || 0}</h3></div>
                                    <div class="p-3 bg-light rounded-circle"><i class="bi bi-people fs-1 text-warning"></i></div>
                                </div>
                            </div>
                        </div>`;
                        break;
                    }

                    // POS
                    case 'pos': {
                        pageTitle.textContent = 'Punto de Venta';

                        const storedUser = sessionStorage.getItem('usuario_actual');
                        const uLocal = usuarioActual || (storedUser ? JSON.parse(storedUser) : null);
                        const rolLocal = (uLocal && uLocal.rol ? uLocal.rol : '').toUpperCase();
                        const esCliente = rolLocal === 'CLIENTE';

                        const resProd = await fetch('backend.php?action=get_productos');
                        const productos = await resProd.json();
                        
                        let productosHTML = '';
                        if(productos.length > 0) {
                            productos.forEach(p => {
                                productosHTML += renderProductoCard(p.id_producto, p.nombre, parseFloat(p.precio));
                            });
                        } else {
                            productosHTML = '<div class="col-12 text-center text-muted">No hay productos activos</div>';
                        }

                        // Si es CAJERO/ADMIN, intentar cargar primer pedido pendiente al carrito
                        if (!esCliente) {
                            const resPed = await fetch('backend.php?action=get_pedidos');
                            const pedidos = await resPed.json();
                            if (pedidos.length > 0 && pedidos[0].detalle) {
                                const p0 = pedidos[0];
                                try {
                                    carritoPOS = JSON.parse(p0.detalle) || [];
                                    metodoPago = p0.metodo_pago || 'Efectivo';
                                } catch(e) {
                                    carritoPOS = [];
                                }
                            } else {
                                carritoPOS = [];
                            }
                        }

                        htmlContent = `
                        <div class="row">
                            <div class="col-md-8">
                                <div class="input-group mb-3">
                                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control border-start-0" placeholder="Buscar producto...">
                                </div>
                                <div class="row g-3" id="productos-container">${productosHTML}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="card shadow-sm border-0 ticket-panel">
                                    <div class="card-header bg-primary text-white text-center fw-bold">PEDIDO ACTUAL</div>
                                    <div class="card-body p-0" id="pos-carrito-body">
                                        <div class="text-center text-muted py-5"><i class="bi bi-cart-x display-4"></i><p class="mt-2">Carrito vacío</p></div>
                                    </div>
                                    <div class="card-footer bg-white border-top">
                                        <div class="d-flex justify-content-between small mb-1">
                                            <span>Subtotal:</span>
                                            <span id="pos-subtotal">S/ 0.00</span>
                                        </div>
                                        <div class="d-flex justify-content-between small mb-2">
                                            <span>IGV (18%):</span>
                                            <span id="pos-igv">S/ 0.00</span>
                                        </div>
                                        <div class="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
                                            <span>TOTAL:</span>
                                            <span id="pos-total">S/ 0.00</span>
                                        </div>

                                        ${esCliente ? `
                                        <div class="btn-group w-100 mt-3" role="group">
                                            <button type="button" class="btn btn-primary btn-sm active" onclick="seleccionarPago('Efectivo', this)">Efectivo</button>
                                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="seleccionarPago('Tarjeta', this)">Tarjeta</button>
                                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="seleccionarPago('Yape', this)">Yape</button>
                                        </div>` : ''}

                                        <button class="btn btn-primary w-100 mt-3" onclick="realizarVenta()">
                                            ${esCliente ? 'ENVIAR PEDIDO' : 'IMPRIMIR BOLETA'}
                                        </button>
                                        <button class="btn btn-outline-danger w-100 mt-2" onclick="cancelarCarrito()">CANCELAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                        break;
                    }

                    // USUARIOS
                    case 'usuarios': {
                        pageTitle.textContent = 'Gestión de Usuarios';
                        const resUser = await fetch('backend.php?action=get_usuarios');
                        const listUsers = await resUser.json();
                        
                        let htmlUsers = '';
                        listUsers.forEach(u => {
                            let badge = u.estado === 'Activo' ? 'bg-success' : 'bg-secondary';
                            htmlUsers += `<tr><td>${u.id_usuario}</td><td><div class="fw-bold">${u.nombres}</div><small class="text-muted">@${u.username}</small></td><td>${u.rol}</td><td><span class="badge ${badge}">${u.estado}</span></td></tr>`;
                        });

                        htmlContent = `
                        <div class="card shadow-sm border-0">
                            <div class="card-header bg-white py-3"><h5 class="mb-0 text-primary">Listado de Personal</h5></div>
                            <div class="card-body p-0 table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead class="bg-light"><tr><th class="ps-4">ID</th><th>Usuario</th><th>Rol</th><th>Estado</th></tr></thead>
                                    <tbody>${htmlUsers}</tbody>
                                </table>
                            </div>
                        </div>`;
                        break;
                    }
                    
                    // CLIENTES
                    case 'clientes': {
                        pageTitle.textContent = 'Gestión de Clientes';
                        const resCli = await fetch('backend.php?action=get_clientes');
                        const listCli = await resCli.json();
                        
                        let htmlCli = '';
                        listCli.forEach(c => {
                            htmlCli += `<tr><td>${c.id_cliente}</td><td><span class="fw-bold">${c.nombre}</span></td><td>${c.telefono}</td><td>${c.direccion}</td></tr>`;
                        });
                        
                        htmlContent = `<div class="card shadow-sm border-0"><div class="card-body p-0 table-responsive"><table class="table table-hover align-middle mb-0"><thead class="bg-light"><tr><th class="ps-4">ID</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th></tr></thead><tbody>${htmlCli}</tbody></table></div></div>`;
                        break;
                    }
                }
            } catch (error) {
                console.error("Error cargando pantalla:", error);
                htmlContent = `<div class="alert alert-danger">Error de conexión: No se pudo cargar la información. Revisa que backend.php esté funcionando.</div>`;
            }

            contenidoPrincipal.innerHTML = htmlContent;
            contenidoPrincipal.style.opacity = '1';
            
            if(screenName === 'pos') {
                actualizarVistaCarrito();
            }

        }, 150);
    };

    // --- FUNCIONES POS ---
    window.renderProductoCard = function(id, nombre, precio) {
        return `
        <div class="col-md-4 col-sm-6">
            <div class="card product-grid-card h-100 border-0 shadow-sm p-2 text-center">
                <i class="bi bi-basket display-5 text-primary mb-2 mt-2"></i>
                <h6 class="card-title fw-bold mb-1">${nombre}</h6>
                <p class="text-success fw-bold m-0">S/ ${precio.toFixed(2)}</p>
                <button class="btn btn-sm btn-outline-primary mt-2 rounded-pill" onclick="agregarAlCarrito(${id}, '${nombre}', ${precio})">
                    <i class="bi bi-plus"></i> Agregar
                </button>
            </div>
        </div>`;
    };

    window.agregarAlCarrito = function(id, nombre, precio) {
        const existente = carritoPOS.find(p => p.id === id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carritoPOS.push({ id, nombre, precio, cantidad: 1 });
        }
        actualizarVistaCarrito();
    };

    window.actualizarVistaCarrito = function() {
        const divCarrito   = document.getElementById('pos-carrito-body');
        const spanSubtotal = document.getElementById('pos-subtotal');
        const spanIgv      = document.getElementById('pos-igv');
        const spanTotal    = document.getElementById('pos-total');
        
        if (!divCarrito) return;

        if (carritoPOS.length === 0) {
            divCarrito.innerHTML = `<div class="text-center text-muted py-5"><i class="bi bi-cart-x display-4"></i><p class="mt-2">Carrito vacío</p></div>`;
            if(spanSubtotal) spanSubtotal.textContent = 'S/ 0.00';
            if(spanIgv)      spanIgv.textContent      = 'S/ 0.00';
            if(spanTotal)    spanTotal.textContent    = 'S/ 0.00';
            return;
        }

        let html = '<ul class="list-group list-group-flush">';
        let subtotal = 0;
        carritoPOS.forEach((prod, index) => {
            const linea = prod.precio * prod.cantidad;
            subtotal += linea;
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                        <small class="fw-bold">${prod.cantidad}x ${prod.nombre}</small>
                        <div class="text-muted" style="font-size:0.8rem">S/ ${prod.precio.toFixed(2)} c/u</div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">S/ ${linea.toFixed(2)}</div>
                        <button class="btn btn-sm text-danger mt-1" onclick="eliminarDelCarrito(${index})"><i class="bi bi-x-circle"></i></button>
                    </div>
                </li>`;
        });
        html += '</ul>';
        divCarrito.innerHTML = html;

        const igv = subtotal * 0.18;
        const total = subtotal + igv;
        if (spanSubtotal) spanSubtotal.textContent = 'S/ ' + subtotal.toFixed(2);
        if (spanIgv)      spanIgv.textContent      = 'S/ ' + igv.toFixed(2);
        if (spanTotal)    spanTotal.textContent    = 'S/ ' + total.toFixed(2);
    };

    window.eliminarDelCarrito = function(index) {
        carritoPOS.splice(index, 1);
        actualizarVistaCarrito();
    };

    window.cancelarCarrito = function() {
        carritoPOS = [];
        actualizarVistaCarrito();
    };

    window.seleccionarPago = function(metodo, btn) {
        metodoPago = metodo;
        if (!btn || !btn.parentElement) return;
        const grupo = btn.parentElement.querySelectorAll('button');
        grupo.forEach(b => {
            b.classList.remove('btn-primary', 'active');
            b.classList.add('btn-outline-primary');
        });
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary', 'active');
    };

    // Registrar venta o enviar pedido
    window.realizarVenta = function() {
        if(carritoPOS.length === 0) return alert("El carrito está vacío");

        const subtotal   = carritoPOS.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        const igv        = subtotal * 0.18;
        const totalVenta = subtotal + igv;

        const stored = sessionStorage.getItem('usuario_actual');
        const u      = usuarioActual || (stored ? JSON.parse(stored) : null);
        const rol    = (u && u.rol ? u.rol : '').toUpperCase();

        // CLIENTE: solo envía pedido
        if (rol === 'CLIENTE') {
            const mesa = prompt('Ingrese la mesa del cliente', 'MESA 1') || 'SIN MESA';
            fetch('backend.php?action=guardar_pedido', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    total: totalVenta,
                    mesa: mesa,
                    id_cliente: u && u.id_usuario ? u.id_usuario : 1,
                    metodo_pago: metodoPago,
                    productos: carritoPOS
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    alert('¡Pedido enviado al cajero!');
                    carritoPOS = [];
                    actualizarVistaCarrito();
                } else {
                    alert('Error al guardar pedido: ' + (data.error || ''));
                }
            })
            .catch(() => alert('Error de conexión al enviar pedido'));
            return;
        }

        // CAJERO / ADMIN: registra venta y genera boleta
        fetch('backend.php?action=guardar_venta', {
            method: 'POST',
            body: JSON.stringify({ total: totalVenta, productos: carritoPOS, metodo_pago: metodoPago }),
            headers: {'Content-Type': 'application/json'}
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert("¡Venta registrada con éxito!");

                const win = window.open('', '_blank');
                let html = `<!DOCTYPE html><html><head><title>Comprobante de Venta</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body{font-family: 'Courier New', monospace; padding:20px;}
                        .boleta-paper{max-width:350px;margin:0 auto;border:1px solid #ddd;padding:16px;}
                        .boleta-paper h5{text-align:center;margin-bottom:10px;}
                        table{width:100%;font-size:12px;}
                        th,td{padding:2px 0;}
                        .totales td{font-weight:bold;}
                    </style>
                </head><body>`;

                html += `<div class="boleta-paper">
                    <h5>CEVICHERÍA "EL BUEN SABOR"</h5>
                    <p style="font-size:11px;">Comprobante de Venta<br>${new Date().toLocaleString('es-PE')}</p>
                    <p style="font-size:11px;">Forma de pago: ${metodoPago}</p>

                    <hr/>
                    <table>
                        <thead><tr><th>DESC</th><th class="text-end">CANT</th><th class="text-end">IMP</th></tr></thead>
                        <tbody>`;

                carritoPOS.forEach(p => {
                    const linea = p.precio * p.cantidad;
                    html += `<tr><td>${p.nombre}</td><td class="text-end">${p.cantidad}</td><td class="text-end">${linea.toFixed(2)}</td></tr>`;
                });

                html += `</tbody>
                        <tfoot class="totales">
                            <tr><td colspan="2">SUBTOTAL</td><td class="text-end">${subtotal.toFixed(2)}</td></tr>
                            <tr><td colspan="2">IGV (18%)</td><td class="text-end">${igv.toFixed(2)}</td></tr>
                            <tr><td colspan="2">TOTAL</td><td class="text-end">${totalVenta.toFixed(2)}</td></tr>
                        </tfoot>
                    </table>
                    <p class="text-center mt-3" style="font-size:11px;">¡GRACIAS POR SU PREFERENCIA!</p>
                </div>`;

                html += `<script>window.print();<\/script></body></html>`;
                win.document.write(html);
                win.document.close();

                carritoPOS = [];
                actualizarVistaCarrito();
            } else {
                alert("Error al guardar: " + data.error);
            }
        })
        .catch(err => alert("Error de conexión al guardar venta"));
    };

    // solo debug
    fetch('backend.php?action=get_clientes')
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error('Error:', err));
});