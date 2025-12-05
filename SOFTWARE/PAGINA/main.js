document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS SIMULADOS ---
    const usuarios = [
        { username: 'admin', password: '123', rol: 'ADMINISTRADOR', nombre: 'Admin Principal' }
    ];

    // Datos simulados para la pantalla de Gestión de Usuarios
    const listaUsuariosDB = [
        { id: 1, nombre: 'Admin Principal', usuario: 'admin', rol: 'ADMINISTRADOR', estado: 'Activo' },
        { id: 2, nombre: 'Juan Pérez', usuario: 'juanp', rol: 'CAJERO', estado: 'Activo' },
        { id: 3, nombre: 'Maria Cocina', usuario: 'maria', rol: 'COCINA', estado: 'Inactivo' }
    ];

    // Datos simulados para la pantalla de Gestión de Clientes
    const listaClientesDB = [
        { id: 1, doc: '70112233', nombre: 'Carlos Ruiz', telefono: '999-888-777', direccion: 'Av. Larco 123' },
        { id: 2, doc: '10203040', nombre: 'Empresa SAC', telefono: '01-222-3333', direccion: 'Jr. Unión 456' },
        { id: 3, doc: '45456677', nombre: 'Ana Gomez', telefono: '987-654-321', direccion: 'Urb. Los Pinos' }
    ];

    // Elementos del DOM
    const loginSection = document.getElementById('loginSection');
    const wrapper = document.getElementById('wrapper');
    const loginForm = document.getElementById('loginForm');
    const contenidoPrincipal = document.getElementById('contenido-principal');
    const pageTitle = document.getElementById('pageTitle');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    const wrapperDiv = document.getElementById('wrapper');
    const btnLogout = document.getElementById('btn-logout');

    // Inicialización: Ocultar dashboard, mostrar fecha
    wrapper.style.display = 'none';
    document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- LOGICA DE LOGIN ---
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        const foundUser = usuarios.find(u => u.username === user && u.password === pass);

        if (foundUser) {
            loginSection.style.display = 'none';
            wrapper.style.display = 'flex'; // Mostrar layout flex
            loadScreen('dashboard'); // Cargar dashboard por defecto
        } else {
            alert('Credenciales incorrectas');
        }
    });

    // --- LOGICA DE SIDEBAR ---
    menuToggle.addEventListener('click', function() {
        wrapperDiv.classList.toggle('toggled');
    });

    btnLogout.addEventListener('click', function() {
        wrapper.style.display = 'none';
        loginSection.style.display = 'flex';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });

    // Manejo de clicks en menú (Delegación simple o directa)
    document.getElementById('menu-dashboard').addEventListener('click', () => loadScreen('dashboard'));
    document.getElementById('menu-pos').addEventListener('click', () => loadScreen('pos'));
    document.getElementById('menu-usuarios').addEventListener('click', () => loadScreen('usuarios'));
    document.getElementById('menu-clientes').addEventListener('click', () => loadScreen('clientes'));

    // --- FUNCIÓN CENTRAL DE NAVEGACIÓN ---
    window.loadScreen = function(screenName) {
        // Reset active classes
        document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
        
        // Animación simple de fade out/in
        contenidoPrincipal.style.opacity = '0';
        
        setTimeout(() => {
            switch(screenName) {
                case 'dashboard':
                    document.getElementById('menu-dashboard').classList.add('active');
                    pageTitle.textContent = 'Dashboard General';
                    contenidoPrincipal.innerHTML = `
                        <div class="row g-3">
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div>
                                        <h5 class="text-muted fw-normal mt-0">Ventas Hoy</h5>
                                        <h3 class="fw-bold">S/ 1,250.00</h3>
                                    </div>
                                    <div class="p-3 bg-light rounded-circle">
                                        <i class="bi bi-cash-coin fs-1 text-success"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div>
                                        <h5 class="text-muted fw-normal mt-0">Pedidos</h5>
                                        <h3 class="fw-bold">24</h3>
                                    </div>
                                    <div class="p-3 bg-light rounded-circle">
                                        <i class="bi bi-basket fs-1 text-primary"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between">
                                    <div>
                                        <h5 class="text-muted fw-normal mt-0">Clientes</h5>
                                        <h3 class="fw-bold">12</h3>
                                    </div>
                                    <div class="p-3 bg-light rounded-circle">
                                        <i class="bi bi-people fs-1 text-warning"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'pos':
                    document.getElementById('menu-pos').classList.add('active');
                    pageTitle.textContent = 'Punto de Venta';
                    contenidoPrincipal.innerHTML = `
                        <div class="row">
                            <div class="col-md-8">
                                <div class="input-group mb-3">
                                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control border-start-0" placeholder="Buscar producto...">
                                </div>
                                <div class="row g-3" id="productos-container">
                                    <!-- Productos de ejemplo -->
                                    ${renderProductoCard('Ceviche Clásico', 35.00, 'bi-cloud-haze2')}
                                    ${renderProductoCard('Jalea Mixta', 45.00, 'bi-cloud-rain')}
                                    ${renderProductoCard('Arroz con Mariscos', 38.00, 'bi-fire')}
                                    ${renderProductoCard('Chicha Morada Jarra', 15.00, 'bi-cup-straw')}
                                    ${renderProductoCard('Causa Limeña', 20.00, 'bi-layers')}
                                    ${renderProductoCard('Leche de Tigre', 12.00, 'bi-lightning')}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card shadow-sm border-0 ticket-panel">
                                    <div class="card-header bg-white border-bottom fw-bold">Ticket de Venta #00123</div>
                                    <div class="card-body">
                                        <div class="text-center text-muted py-5">
                                            <i class="bi bi-cart-x display-4"></i>
                                            <p class="mt-2">Carrito vacío</p>
                                        </div>
                                    </div>
                                    <div class="card-footer bg-white border-top">
                                        <div class="d-flex justify-content-between fw-bold fs-5">
                                            <span>Total:</span>
                                            <span>S/ 0.00</span>
                                        </div>
                                        <button class="btn btn-primary w-100 mt-3">COBRAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'usuarios':
                    document.getElementById('menu-usuarios').classList.add('active');
                    pageTitle.textContent = 'Gestión de Usuarios';
                    
                    // Generar filas de tabla dinámicamente
                    let htmlUsuarios = '';
                    listaUsuariosDB.forEach(u => {
                        let badgeClass = u.estado === 'Activo' ? 'bg-success' : 'bg-secondary';
                        htmlUsuarios += `
                            <tr>
                                <td>${u.id}</td>
                                <td><div class="fw-bold">${u.nombre}</div><small class="text-muted">@${u.usuario}</small></td>
                                <td>${u.rol}</td>
                                <td><span class="badge ${badgeClass}">${u.estado}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });

                    contenidoPrincipal.innerHTML = `
                        <div class="card shadow-sm border-0">
                            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                <h5 class="mb-0 text-primary">Listado de Personal</h5>
                                <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-2"></i>Nuevo Usuario</button>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light">
                                            <tr>
                                                <th class="ps-4">#</th>
                                                <th>Nombre / Usuario</th>
                                                <th>Rol</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${htmlUsuarios}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-footer bg-white py-3">
                                <small class="text-muted">Mostrando ${listaUsuariosDB.length} usuarios registrados</small>
                            </div>
                        </div>
                    `;
                    break;

                case 'clientes':
                    document.getElementById('menu-clientes').classList.add('active');
                    pageTitle.textContent = 'Gestión de Clientes';

                    // Generar filas de tabla dinámicamente
                    let htmlClientes = '';
                    listaClientesDB.forEach(c => {
                        htmlClientes += `
                            <tr>
                                <td>${c.id}</td>
                                <td><span class="fw-bold text-dark">${c.doc}</span></td>
                                <td>${c.nombre}</td>
                                <td>${c.telefono}</td>
                                <td><small class="text-muted">${c.direccion}</small></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                                </td>
                            </tr>
                        `;
                    });

                    contenidoPrincipal.innerHTML = `
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control border-start-0" placeholder="Buscar por DNI o Nombre...">
                                </div>
                            </div>
                            <div class="col-md-6 text-end">
                                <button class="btn btn-success"><i class="bi bi-person-plus me-2"></i>Nuevo Cliente</button>
                            </div>
                        </div>

                        <div class="card shadow-sm border-0">
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light">
                                            <tr>
                                                <th class="ps-4">ID</th>
                                                <th>Documento</th>
                                                <th>Razón Social / Nombre</th>
                                                <th>Teléfono</th>
                                                <th>Dirección</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${htmlClientes}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                
                default:
                    contenidoPrincipal.innerHTML = `
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

});