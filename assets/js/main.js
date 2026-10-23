/* ==========================================================
   FERRETERÍA EL CONSTRUCTOR — JS PRINCIPAL
   ========================================================== */

/* ---------- 1. TEMA (claro / oscuro) ---------- */
(function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

/* ---------- 2. MAPA DE UNIDADES ---------- */
const UNIDADES_MAP = {
    piezas:  { singular: 'pieza',       plural: 'piezas',     label: 'Piezas' },
    cajas:   { singular: 'caja',        plural: 'cajas',      label: 'Cajas' },
    metros:  { singular: 'metro',       plural: 'metros',     label: 'Metros' },
    m2:      { singular: 'm²',          plural: 'm²',         label: 'm²' },
    cuarto:  { singular: 'cuarto',      plural: 'cuartos',    label: 'Cuarto' },
    octavo:  { singular: 'octavo',      plural: 'octavos',    label: 'Octavo' },
    medio:   { singular: 'medio galón', plural: 'medios',     label: 'Medio galón' },
    galon:   { singular: 'galón',       plural: 'galones',    label: 'Galón' },
    cubeta:  { singular: 'cubeta',      plural: 'cubetas',    label: 'Cubeta' },
    litro:   { singular: 'litro',       plural: 'litros',     label: 'Litros' },
    onza:    { singular: 'onza',        plural: 'onzas',      label: 'Onzas' },
    libra:   { singular: 'libra',       plural: 'libras',     label: 'Libras' },
    quintal: { singular: 'quintal',     plural: 'quintales',  label: 'Quintal' },
    yarda:   { singular: 'yarda',       plural: 'yardas',     label: 'Yardas' },
    rollo:   { singular: 'rollo',       plural: 'rollos',     label: 'Rollos' },
    saco:    { singular: 'saco',        plural: 'sacos',      label: 'Sacos' },
    unidad:  { singular: 'unidad',      plural: 'unidades',   label: 'Unidades' },
    juego:   { singular: 'juego',       plural: 'juegos',     label: 'Juegos' },
    par:     { singular: 'par',         plural: 'pares',      label: 'Pares' },
    bolsa:   { singular: 'bolsa',       plural: 'bolsas',     label: 'Bolsas' },
    caja:    { singular: 'caja',        plural: 'cajas',      label: 'Caja' }
};

/* ---------- 3. CARGA DE COMPONENTES (header / footer) ---------- */
async function loadComponent(id, path) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
        el.innerHTML = await res.text();
    } catch (err) {
        console.error(err);
    }
}

/* ---------- 4. INICIALIZACIÓN ---------- */
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header-container', '/assets/components/header.html');
    await loadComponent('footer-container', '/assets/components/footer.html');

    initHeaderScroll();
    initThemeToggle();
    initSlider();
    initCart();
    initSearch();
    updateYear();
});

/* ---------- 5. HEADER ---------- */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const isHome = location.pathname === '/' || location.pathname.endsWith('index.html');

    const update = () => {
        if (!isHome || window.scrollY > 40) {
            header.classList.add('solid');
        } else {
            header.classList.remove('solid');
        }
    };
    update();
    window.addEventListener('scroll', update);
}

/* ---------- 6. BOTÓN DE TEMA ---------- */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

/* ---------- 7. SLIDER ---------- */
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    if (!slides.length) return;

    let current = 0;
    let timer;

    const show = (i) => {
        if (i >= slides.length) current = 0;
        else if (i < 0) current = slides.length - 1;
        else current = i;

        slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
        dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    };

    const nextSlide = () => show(current + 1);
    const prevSlide = () => show(current - 1);

    const start = () => { timer = setInterval(nextSlide, 5500); };
    const reset = () => { clearInterval(timer); start(); };

    next?.addEventListener('click', () => { nextSlide(); reset(); });
    prev?.addEventListener('click', () => { prevSlide(); reset(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); reset(); }));

    show(0);
    start();
}

/* ---------- 8. AÑO DEL FOOTER ---------- */
function updateYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
}

/* ---------- 9. CARRITO ---------- */
let carrito = JSON.parse(localStorage.getItem('cotizacion') || '[]');

function initCart() {
    updateCartCount();
    bindCartEvents();
}

function saveCart() {
    localStorage.setItem('cotizacion', JSON.stringify(carrito));
    updateCartCount();
}

function updateCartCount() {
    const count = document.getElementById('cart-count');
    if (!count) return;
    const total = carrito.reduce((sum, it) => sum + it.cantidad, 0);
    count.textContent = total;
    count.classList.toggle('visible', total > 0);
}

/* ---------- Formato bonito de un item ---------- */
function formatearItem(item) {
    const cant = item.cantidad || 1;
    const unidad = item.unidad || 'piezas';
    const u = UNIDADES_MAP[unidad] || UNIDADES_MAP.piezas;
    const nombreUnidad = cant === 1 ? u.singular : u.plural;
    return `${cant} ${nombreUnidad} de ${item.nombre}`;
}

/* ---------- Eventos del carrito ---------- */
function bindCartEvents() {
    document.addEventListener('click', (e) => {
        // Abrir modal del carrito
        if (e.target.closest('#btn-carrito')) {
            renderCartModal();
            document.getElementById('cart-modal')?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        // Cerrar modales
        const closeBtn = e.target.closest('[data-close-modal]');
        if (closeBtn) {
            closeBtn.closest('.modal')?.classList.remove('active');
            document.body.style.overflow = '';
        }
        // Clic afuera
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
        // Eliminar item
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.index, 10);
            carrito.splice(idx, 1);
            saveCart();
            renderCartModal();
        }
        // Abrir modal de confirmación (vaciar)
        if (e.target.closest('#empty-cart')) {
            document.getElementById('confirm-modal')?.classList.add('active');
        }
        // Confirmar vaciado
        if (e.target.closest('#confirm-empty-yes')) {
            carrito = [];
            saveCart();
            renderCartModal();
            document.getElementById('confirm-modal')?.classList.remove('active');
        }
        // Enviar por WhatsApp
        if (e.target.closest('#send-whatsapp')) {
            enviarCotizacion();
        }

        // ----- Agregar al carrito -----
        const addBtn = e.target.closest('.btn-add-cart');
        if (addBtn) {
            e.preventDefault();

            // Si viene con cantidad fija (calculadora de ficha)
            if (addBtn.dataset.fixedQty && parseInt(addBtn.dataset.fixedQty) > 0) {
                const cant = parseInt(addBtn.dataset.fixedQty);
                const unidad = addBtn.dataset.fixedUnidad || 'piezas';
                const item = {
                    id: addBtn.dataset.id,
                    nombre: addBtn.dataset.nombre,
                    imagen: addBtn.dataset.imagen,
                    cantidad: cant,
                    unidad
                };
                const exist = carrito.find(p => p.id === item.id && (p.unidad || 'piezas') === unidad);
                if (exist) exist.cantidad += cant;
                else carrito.push(item);
                saveCart();
                showToast(`✅ ${formatearItem(item)} agregado`);
            } else {
                abrirModalCantidad(
                    addBtn.dataset.id,
                    addBtn.dataset.nombre,
                    addBtn.dataset.imagen,
                    addBtn.dataset.unidades || 'piezas'
                );
            }
        }

        // ----- Selector de unidad dentro del modal -----
        const unidadBtn = e.target.closest('.qty-unidad-btn');
        if (unidadBtn) {
            const modal = unidadBtn.closest('#qty-modal');
            modal?.querySelectorAll('.qty-unidad-btn').forEach(b => b.classList.remove('active'));
            unidadBtn.classList.add('active');
        }

        // ----- Controladores del modal -----
        const qtyMenos = e.target.closest('#qty-menos');
        const qtyMas = e.target.closest('#qty-mas');
        const qtyConfirmar = e.target.closest('#qty-confirmar');

        if (qtyMenos) {
            const inp = document.getElementById('qty-input');
            if (inp) inp.value = Math.max(1, (parseInt(inp.value) || 1) - 1);
        }
        if (qtyMas) {
            const inp = document.getElementById('qty-input');
            if (inp) inp.value = (parseInt(inp.value) || 0) + 1;
        }
        if (qtyConfirmar) {
            const inp = document.getElementById('qty-input');
            const cant = parseInt(inp?.value) || 1;
            const confirmBtnEl = document.getElementById('qty-confirmar');
            const id = confirmBtnEl.dataset.id;
            const nombre = confirmBtnEl.dataset.nombre;
            const imagen = confirmBtnEl.dataset.imagen;

            const modal = confirmBtnEl.closest('#qty-modal');
            const activo = modal?.querySelector('.qty-unidad-btn.active');
            const unidad = activo?.dataset.unidad
                        || confirmBtnEl.dataset.unidadDefault
                        || 'piezas';

            const item = { id, nombre, imagen, cantidad: cant, unidad };

            const exist = carrito.find(p => p.id === item.id && (p.unidad || 'piezas') === unidad);
            if (exist) exist.cantidad += cant;
            else carrito.push(item);

            saveCart();
            showToast(`✅ ${formatearItem(item)} agregado`);

            modal?.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function renderCartModal() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;

    if (carrito.length === 0) {
        list.innerHTML = `<p class="cart-empty">No hay productos en tu cotización.</p>`;
        return;
    }
    list.innerHTML = carrito.map((item, i) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <img src="${item.imagen}" class="cart-item-img" alt="${item.nombre}">
                <span class="cart-item-name">${formatearItem(item)}</span>
            </div>
            <button class="btn-remove" data-index="${i}" aria-label="Eliminar">🗑️</button>
        </div>
    `).join('');
}

function enviarCotizacion() {
    if (carrito.length === 0) {
        showToast('⚠️ Tu cotización está vacía');
        return;
    }
    let msg = 'Hola, me interesa cotizar los siguientes productos:\n\n';
    carrito.forEach(it => { msg += `• ${formatearItem(it)}\n`; });
    msg += '\n¿Me pueden indicar precio y disponibilidad? Gracias.';
    window.open(`https://wa.me/50361498918?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ---------- 10. TOAST ---------- */
function showToast(text) {
    const cont = document.getElementById('toast-container');
    if (!cont) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    cont.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

/* ---------- 11. BUSCADOR ---------- */
function initSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchButton');
    if (!input || !btn) return;

    const go = () => {
        const q = input.value.trim();
        if (!q) return;
        location.href = `/pages/busqueda.html?q=${encodeURIComponent(q)}`;
    };
    btn.addEventListener('click', go);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') go(); });
}

/* ---------- 12. MODAL DE CANTIDAD ---------- */
function abrirModalCantidad(id, nombre, imagen, unidadesStr = 'piezas') {
    inyectarModalCantidad();
    const modal = document.getElementById('qty-modal');
    if (!modal) return;

    const unidadesPermitidas = unidadesStr.split(',').map(u => u.trim()).filter(Boolean);

    document.getElementById('qty-img').src = imagen || '';
    document.getElementById('qty-nombre').textContent = nombre;
    document.getElementById('qty-input').value = 1;

    const unidadesRow = modal.querySelector('.qty-unidad-row');

    if (unidadesPermitidas.length <= 1) {
        // Una sola unidad → ocultar selector
        unidadesRow.style.display = 'none';
    } else {
        // Varias unidades → generar botones dinámicamente
        unidadesRow.style.display = 'flex';
        unidadesRow.innerHTML = unidadesPermitidas.map((u, i) => {
            const info = UNIDADES_MAP[u] || { label: u };
            return `<button type="button"
                            class="qty-unidad-btn ${i === 0 ? 'active' : ''}"
                            data-unidad="${u}">${info.label}</button>`;
        }).join('');
    }

    const confirmBtn = document.getElementById('qty-confirmar');
    confirmBtn.dataset.id = id;
    confirmBtn.dataset.nombre = nombre;
    confirmBtn.dataset.imagen = imagen;
    confirmBtn.dataset.unidadDefault = unidadesPermitidas[0] || 'piezas';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function inyectarModalCantidad() {
    if (document.getElementById('qty-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'qty-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h3>Agregar a cotización</h3>
                <button class="modal-close" data-close-modal aria-label="Cerrar">✕</button>
            </div>
            <div class="qty-modal-product">
                <img id="qty-img" src="" alt="">
                <p id="qty-nombre"></p>
            </div>

            <div class="qty-unidad-row"></div>

            <div class="qty-modal-controls">
                <button id="qty-menos" type="button" aria-label="Restar">−</button>
                <input type="number" id="qty-input" value="1" min="1">
                <button id="qty-mas" type="button" aria-label="Sumar">+</button>
            </div>
            <div class="modal-actions">
                <button class="btn-ghost" data-close-modal>Cancelar</button>
                <button class="btn-primary" id="qty-confirmar">Agregar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Adaptador: Convierte el formato de Supabase al formato que espera tu HTML
function adaptarProducto(dbProducto) {
    const especs = dbProducto.especificaciones || {};
    const imagenes = dbProducto.imagenes || [];
    
    return {
        id: dbProducto.codigo,
        codigo: dbProducto.codigo,
        nombre: dbProducto.nombre,
        marca: (dbProducto.marcas && dbProducto.marcas.nombre_marca) ? dbProducto.marcas.nombre_marca : 'Genérico', // Viene del JOIN
        imagen: imagenes[0] || '/assets/img/placeholder.webp',
        imagen_fondo: imagenes[1] || imagenes[0] || '/assets/img/placeholder.webp',
        galeria: imagenes,
        descripcion: dbProducto.descripcion || '',
        // Mapeo de especificaciones
        tamaño: especs.tamaño || especs.medida || '',
        acabado: especs.acabado || '',
        superficie: especs.superficie || '',
        tipo: especs.tipo || '',
        m2_por_caja: especs.m2_por_caja || '',
        piezas_x_caja: especs.piezas_x_caja || '',
        tipologia: especs.tipologia || 'todas',
        unidades: dbProducto.categoria_id === 'CAT-23' ? 'piezas,cajas,m2' : 'piezas', // Ajusta según tu DB
        nuevo: dbProducto.destacado || false
    };
}