document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS SIMULADOS ---
    const usuarios = [
        { username: 'admin', password: '123', rol: 'ADMINISTRADOR', nombre: 'Admin Principal' }
    ];

    // --- ELEMENTOS DOM ---
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const appContainer = document.getElementById('appContainer');
    const menuToggle = document.getElementById('menu-toggle');
    const contenidoPrincipal = document.getElementById('contenido-principal');
    const pageTitle = document.getElementById('pageTitle');
    
    // --- LOGIN ---
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            
            if (usuarios.find(u => u.username === user && u.password === pass)) {
                loginSection.style.display = 'none';
                appContainer.classList.remove('d-none');
                document.getElementById('sidebarUserName').textContent = 'Juan Pérez';
                document.getElementById('sidebarUserRole').textContent = 'Cajero / Admin';
                
                // Poner fecha actual
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-ES', options);
                
                mostrarPagina('inicio');
            } else {
                document.getElementById('loginError').classList.remove('d-none');
            }
        });
    }

    // --- SIDEBAR TOGGLE ---
    if(menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('wrapper').classList.toggle("toggled");
        });
    }

    // --- ENRUTADOR DE PANTALLAS (PROTOTIPOS) ---
    window.mostrarPagina = function(pagina) {
        // Reset scroll
        window.scrollTo(0,0);
        
        // Animación suave
        contenidoPrincipal.style.opacity = '0';
        
        setTimeout(() => {
            switch(pagina) {
                // ---------------------------------------------------------
                // 1. PANTALLA DE REGISTRO DE VENTA (POS)
                // ---------------------------------------------------------
                case 'pos':
                    pageTitle.textContent = 'Registrar Venta';
                    contenidoPrincipal.innerHTML = `
                        <div class="row h-100">
                            <!-- Lado Izquierdo: Catálogo -->
                            <div class="col-md-8">
                                <div class="card shadow-sm mb-3">
                                    <div class="card-body">
                                        <label class="form-label fw-bold">Buscar Cliente:</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" placeholder="DNI o Nombre del cliente">
                                            <button class="btn btn-outline-primary"><i class="bi bi-search"></i> Buscar</button>
                                            <button class="btn btn-outline-secondary" title="Nuevo Cliente"><i class="bi bi-person-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="card shadow-sm">
                                    <div class="card-header bg-white fw-bold py-3">
                                        <i class="bi bi-grid-3x3-gap me-2"></i>PRODUCTOS DEL MENÚ
                                    </div>
                                    <div class="card-body bg-light-blue" style="max-height: 60vh; overflow-y: auto;">
                                        <div class="row g-3">
                                            ${renderProductoCard('Ceviche Mixto', 25.00, 'bi-water')}
                                            ${renderProductoCard('Ceviche Conchas', 22.00, 'bi-record-circle')}
                                            ${renderProductoCard('Arroz c/ Mariscos', 18.00, 'bi-fire')}
                                            ${renderProductoCard('Chicha Morada', 5.00, 'bi-cup-straw')}
                                            ${renderProductoCard('Inca Kola', 4.00, 'bi-cup')}
                                            ${renderProductoCard('Jalea Mixta', 30.00, 'bi-stars')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lado Derecho: Ticket / Pedido Actual -->
                            <div class="col-md-4">
                                <div class="card shadow h-100 border-0">
                                    <div class="card-header bg-primary text-white fw-bold text-center py-3">
                                        PEDIDO ACTUAL
                                    </div>
                                    <div class="card-body d-flex flex-column p-0">
                                        <!-- Lista de items -->
                                        <div class="flex-grow-1 p-3 overflow-auto" style="min-height: 300px;">
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 rounded">
                                                    <div>
                                                        <span class="fw-bold">2x</span> Ceviche Mixto
                                                        <div class="small text-muted">S/ 25.00 c/u</div>
                                                    </div>
                                                    <span class="fw-bold">S/ 50.00</span>
                                                </li>
                                                <li class="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 rounded">
                                                    <div>
                                                        <span class="fw-bold">1x</span> Chicha Morada
                                                        <div class="small text-muted">S/ 5.00 c/u</div>
                                                    </div>
                                                    <span class="fw-bold">S/ 5.00</span>
                                                </li>
                                            </ul>
                                        </div>
                                        
                                        <!-- Totales -->
                                        <div class="p-3 bg-light border-top">
                                            <div class="d-flex justify-content-between mb-1">
                                                <span>Subtotal:</span>
                                                <span>S/ 55.00</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-1 text-muted">
                                                <span>IGV (18%):</span>
                                                <span>S/ 9.90</span>
                                            </div>
                                            <div class="d-flex justify-content-between fs-4 fw-bold text-primary mt-2">
                                                <span>TOTAL:</span>
                                                <span>S/ 64.90</span>
                                            </div>
                                        </div>

                                        <!-- Métodos de Pago y Botones -->
                                        <div class="p-3 border-top">
                                            <div class="btn-group w-100 mb-3" role="group">
                                                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked>
                                                <label class="btn btn-outline-primary" for="btnradio1"><i class="bi bi-cash"></i> Efectivo</label>

                                                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
                                                <label class="btn btn-outline-primary" for="btnradio2"><i class="bi bi-credit-card"></i> Tarjeta</label>

                                                <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off">
                                                <label class="btn btn-outline-primary" for="btnradio3"><i class="bi bi-phone"></i> Yape</label>
                                            </div>

                                            <div class="d-grid gap-2">
                                                <button class="btn btn-primary btn-lg" onclick="mostrarPagina('boleta')">REGISTRAR VENTA</button>
                                                <button class="btn btn-outline-danger" onclick="mostrarPagina('inicio')">CANCELAR</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                // ---------------------------------------------------------
                // 2. PANTALLA DE EMISIÓN DE COMPROBANTE (BOLETA)
                // ---------------------------------------------------------
                case 'boleta':
                    pageTitle.textContent = 'Comprobante de Venta';
                    contenidoPrincipal.innerHTML = `
                        <div class="container text-center py-4">
                            <!-- Papel de Boleta -->
                            <div class="boleta-paper text-start mx-auto mb-4">
                                <div class="text-center boleta-header">
                                    <h4 class="fw-bold mb-1">CEVICHERÍA "EL BUEN SABOR"</h4>
                                    <small class="d-block">Av. Principal 123, Lima</small>
                                    <small class="d-block">RUC: 20123456789</small>
                                    <small class="d-block">Telf: (01) 555-0909</small>
                                </div>
                                
                                <div class="mb-3">
                                    <div><strong>Boleta:</strong> B001-000045</div>
                                    <div><strong>Fecha:</strong> 04/12/2024 11:30:15</div>
                                    <div><strong>Cajero:</strong> Juan Pérez</div>
                                    <div><strong>Cliente:</strong> Consumidor Final</div>
                                </div>
                                
                                <table class="table table-borderless table-sm border-top border-bottom border-dark mb-3">
                                    <thead>
                                        <tr class="border-bottom border-dark">
                                            <th>DESCRIPCIÓN</th>
                                            <th class="text-center">CANT</th>
                                            <th class="text-end">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Ceviche Mixto</td>
                                            <td class="text-center">2</td>
                                            <td class="text-end">50.00</td>
                                        </tr>
                                        <tr>
                                            <td>Chicha Morada</td>
                                            <td class="text-center">1</td>
                                            <td class="text-end">5.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div class="text-end mb-2">
                                    <div class="d-flex justify-content-between"><span>SUBTOTAL:</span> <span>S/ 55.00</span></div>
                                    <div class="d-flex justify-content-between"><span>IGV (18%):</span> <span>S/ 9.90</span></div>
                                    <div class="d-flex justify-content-between fw-bold fs-5 mt-1"><span>TOTAL:</span> <span>S/ 64.90</span></div>
                                </div>
                                
                                <div class="boleta-footer text-center">
                                    <div>FORMA DE PAGO: EFECTIVO</div>
                                    <div>RECIBIDO: S/ 70.00 | VUELTO: S/ 5.10</div>
                                    <div class="mt-3 fw-bold">¡GRACIAS POR SU PREFERENCIA!</div>
                                </div>
                            </div>
                            
                            <!-- Botones de Acción -->
                            <div class="d-flex justify-content-center gap-3 no-print">
                                <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> IMPRIMIR</button>
                                <button class="btn btn-outline-dark"><i class="bi bi-envelope"></i> ENVIAR EMAIL</button>
                                <button class="btn btn-outline-danger"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
                                <button class="btn btn-secondary" onclick="mostrarPagina('pos')">NUEVA VENTA</button>
                            </div>
                        </div>
                    `;
                    break;

                // ---------------------------------------------------------
                // 3. PANTALLA DE GESTIÓN DE INVENTARIO
                // ---------------------------------------------------------
                case 'inventario':
                    pageTitle.textContent = 'Gestión de Inventario';
                    contenidoPrincipal.innerHTML = `
                        <div class="card shadow-sm border-0">
                            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 class="m-0 text-primary"><i class="bi bi-boxes me-2"></i>Listado de Productos</h5>
                                <div class="d-flex gap-2">
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="Buscar producto...">
                                        <button class="btn btn-outline-secondary"><i class="bi bi-search"></i></button>
                                    </div>
                                    <button class="btn btn-success text-white"><i class="bi bi-plus-lg"></i> Agregar</button>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light">
                                            <tr>
                                                <th class="ps-4">PRODUCTO</th>
                                                <th class="text-center">STOCK ACTUAL</th>
                                                <th class="text-center">STOCK MÍN.</th>
                                                <th class="text-center">ESTADO</th>
                                                <th class="text-end pe-4">ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="ps-4 fw-bold">Ceviche Mixto</td>
                                                <td class="text-center">15</td>
                                                <td class="text-center">5</td>
                                                <td class="text-center"><span class="status-badge status-normal">✅ NORMAL</span></td>
                                                <td class="text-end pe-4"><button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button></td>
                                            </tr>
                                            <tr>
                                                <td class="ps-4 fw-bold">Ceviche Conchas</td>
                                                <td class="text-center">3</td>
                                                <td class="text-center">5</td>
                                                <td class="text-center"><span class="status-badge status-low">⚠️ BAJO</span></td>
                                                <td class="text-end pe-4"><button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button></td>
                                            </tr>
                                            <tr>
                                                <td class="ps-4 fw-bold">Camarones (kg)</td>
                                                <td class="text-center fw-bold text-danger">2</td>
                                                <td class="text-center">3</td>
                                                <td class="text-center"><span class="status-badge status-critical">🔴 CRÍTICO</span></td>
                                                <td class="text-end pe-4"><button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button></td>
                                            </tr>
                                            <tr>
                                                <td class="ps-4 fw-bold">Chicha Morada</td>
                                                <td class="text-center">50</td>
                                                <td class="text-center">10</td>
                                                <td class="text-center"><span class="status-badge status-normal">✅ NORMAL</span></td>
                                                <td class="text-end pe-4"><button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-footer bg-white">
                                <div class="d-flex gap-3 text-sm">
                                    <small class="text-warning"><i class="bi bi-exclamation-triangle-fill"></i> 2 productos stock bajo</small>
                                    <small class="text-danger"><i class="bi bi-circle-fill"></i> 1 producto stock crítico</small>
                                </div>
                                <div class="mt-3">
                                    <button class="btn btn-outline-dark btn-sm"><i class="bi bi-file-earmark-text"></i> Generar Reporte</button>
                                    <button class="btn btn-outline-dark btn-sm"><i class="bi bi-bell"></i> Alertas</button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                // ---------------------------------------------------------
                // 4. PANTALLA DE RECEPCIÓN DE INSUMOS
                // ---------------------------------------------------------
                case 'insumos':
                    pageTitle.textContent = 'Recepción de Insumos';
                    contenidoPrincipal.innerHTML = `
                        <div class="card shadow-sm border-0">
                            <div class="card-header bg-primary text-white">
                                <h5 class="m-0"><i class="bi bi-truck me-2"></i>Datos del Proveedor y Factura</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3 mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label text-muted">Proveedor</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" value="Mariscos Perú SAC">
                                            <button class="btn btn-outline-secondary"><i class="bi bi-search"></i></button>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">N° Factura</label>
                                        <input type="text" class="form-control" value="F001-987654">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Fecha Emisión</label>
                                        <input type="date" class="form-control" value="2024-12-04">
                                    </div>
                                </div>

                                <h6 class="fw-bold border-bottom pb-2 mb-3">Detalle de Insumos Recibidos</h6>
                                <table class="table table-bordered align-middle">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>INSUMO</th>
                                            <th width="120">CANTIDAD</th>
                                            <th width="150">VENCIMIENTO</th>
                                            <th width="50"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Camarones (kg)</td>
                                            <td><input type="number" class="form-control form-control-sm" value="10"></td>
                                            <td><input type="date" class="form-control form-control-sm" value="2024-12-15"></td>
                                            <td class="text-center"><i class="bi bi-trash text-danger cursor-pointer"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Conchas (unidad)</td>
                                            <td><input type="number" class="form-control form-control-sm" value="50"></td>
                                            <td><input type="date" class="form-control form-control-sm" value="2024-12-20"></td>
                                            <td class="text-center"><i class="bi bi-trash text-danger cursor-pointer"></i></td>
                                        </tr>
                                        <tr>
                                            <td>Limones (kg)</td>
                                            <td><input type="number" class="form-control form-control-sm" value="20"></td>
                                            <td><input type="date" class="form-control form-control-sm" value="2024-12-10"></td>
                                            <td class="text-center"><i class="bi bi-trash text-danger cursor-pointer"></i></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <button class="btn btn-sm btn-outline-primary mb-3"><i class="bi bi-plus-lg"></i> Agregar Línea</button>

                                <div class="mb-3">
                                    <label class="form-label">Observaciones</label>
                                    <textarea class="form-control" rows="2"></textarea>
                                </div>

                                <div class="d-flex gap-2 justify-content-end border-top pt-3">
                                    <button class="btn btn-secondary" onclick="mostrarPagina('inicio')">Cancelar</button>
                                    <button class="btn btn-info text-white">Validar Calidad</button>
                                    <button class="btn btn-success">REGISTRAR INGRESO</button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                // ---------------------------------------------------------
                // 5. PANTALLA DE REPORTES
                // ---------------------------------------------------------
                case 'reportes':
                    pageTitle.textContent = 'Reportes y Analítica';
                    contenidoPrincipal.innerHTML = `
                        <div class="row mb-4">
                            <div class="col-md-12">
                                <div class="card shadow-sm p-3">
                                    <div class="row g-3 align-items-end">
                                        <div class="col-md-3">
                                            <label class="form-label fw-bold">Tipo de Reporte</label>
                                            <select class="form-select">
                                                <option selected>Ventas Diarias</option>
                                                <option>Ventas Mensuales</option>
                                                <option>Inventario Actual</option>
                                                <option>Productos Top</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Período</label>
                                            <div class="input-group">
                                                <input type="date" class="form-control" value="2024-12-04">
                                                <span class="input-group-text">a</span>
                                                <input type="date" class="form-control" value="2024-12-04">
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <button class="btn btn-primary w-100"><i class="bi bi-funnel"></i> Filtrar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="card shadow border-0">
                                    <div class="card-header bg-white py-3 border-bottom">
                                        <h5 class="fw-bold m-0 text-primary">Resumen: Ventas Diarias (04/12/2024)</h5>
                                    </div>
                                    <div class="card-body">
                                        <!-- Tarjetas de Resumen -->
                                        <div class="row g-3 mb-4 text-center">
                                            <div class="col-md-4">
                                                <div class="p-3 border rounded bg-light">
                                                    <div class="text-muted small text-uppercase">Total Ventas</div>
                                                    <div class="fs-2 fw-bold text-dark">24</div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="p-3 border rounded bg-light">
                                                    <div class="text-muted small text-uppercase">Monto Total</div>
                                                    <div class="fs-2 fw-bold text-success">S/ 1,245.80</div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="p-3 border rounded bg-light">
                                                    <div class="text-muted small text-uppercase">Ticket Promedio</div>
                                                    <div class="fs-2 fw-bold text-info">S/ 51.91</div>
                                                </div>
                                            </div>
                                        </div>

                                        <h6 class="fw-bold mb-3">Ranking de Productos Más Vendidos</h6>
                                        <div class="list-group mb-4">
                                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                                1. Ceviche Mixto
                                                <span class="badge bg-primary rounded-pill">45 unidades</span>
                                            </div>
                                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                                2. Chicha Morada
                                                <span class="badge bg-primary rounded-pill">38 unidades</span>
                                            </div>
                                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                                3. Arroz con Mariscos
                                                <span class="badge bg-primary rounded-pill">22 unidades</span>
                                            </div>
                                        </div>

                                        <div class="d-flex gap-2">
                                            <button class="btn btn-outline-danger"><i class="bi bi-file-pdf"></i> Exportar PDF</button>
                                            <button class="btn btn-outline-success"><i class="bi bi-file-excel"></i> Exportar Excel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                
                // ---------------------------------------------------------
                // DASHBOARD PRINCIPAL (DEFAULT)
                // ---------------------------------------------------------
                default: // inicio
                    pageTitle.textContent = 'Dashboard General';
                    contenidoPrincipal.innerHTML = `
                        <div class="row g-3">
                            <div class="col-md-3">
                                <div class="p-3 bg-white card-custom d-flex justify-content-between align-items-center">
                                    <div><h3 class="fw-bold">25</h3><p class="text-muted mb-0">Pedidos Hoy</p></div>
                                    <i class="bi bi-basket fs-1 text-primary"></i>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="p-3 bg-white card-custom d-flex justify-content-between align-items-center">
                                    <div><h3 class="fw-bold">S/ 1,250</h3><p class="text-muted mb-0">Caja Hoy</p></div>
                                    <i class="bi bi-cash-coin fs-1 text-success"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-12 text-center text-muted py-5">
                                <i class="bi bi-arrow-up-circle display-4"></i>
                                <p class="mt-3">Seleccione una opción del menú para comenzar.</p>
                            </div>
                        </div>
                    `;
            }
            contenidoPrincipal.style.opacity = '1';
        }, 150);
    };

    // Helper para generar tarjetas de producto
    function renderProductoCard(nombre, precio, icono) {
        return `
        <div class="col-md-4 col-sm-6">
            <div class="card product-grid-card h-100 border-0 shadow-sm p-2 text-center">
                <i class="bi ${icono} display-5 text-primary mb-2 mt-2"></i>
                <h6 class="card-title fw-bold mb-1">${nombre}</h6>
                <p class="text-success fw-bold m-0">S/ ${precio.toFixed(2)}</p>
                <button class="btn btn-sm btn-outline-primary mt-2 rounded-pill"><i class="bi bi-plus"></i> Agregar</button>
            </div>
        </div>`;
    }

    // Cargar página inicial
    // mostrarPagina('inicio'); // Se llama tras login
});

window.cerrarSesion = function() {
    location.reload();
};