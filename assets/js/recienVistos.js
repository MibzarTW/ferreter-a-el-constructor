/* ==========================================================
   RECIÉN VISTOS — Productos que el usuario ha visitado
   (últimos 14 días, máximo 8 en pantalla vía localStorage)
   ========================================================== */

const DIAS_EXPIRA_VISTOS = 14;
const MAX_MOSTRAR = 8;

document.addEventListener('DOMContentLoaded', () => {
    const seccion = document.getElementById('recien-vistos-section');
    const carrusel = document.getElementById('recien-vistos-carrusel');
    if (!seccion || !carrusel) return;

    // Leer localStorage
    let lista = [];
    try {
        lista = JSON.parse(localStorage.getItem('recienVistos') || '[]');
    } catch (e) {
        lista = [];
    }

    // Filtrar por antigüedad
    const ahora = Date.now();
    const limite = DIAS_EXPIRA_VISTOS * 24 * 60 * 60 * 1000;
    lista = lista.filter(it => (ahora - it.fecha) < limite);

    // Si no hay nada, ocultar la sección y salir
    if (!lista.length) {
        seccion.style.display = 'none';
        return;
    }

    // Limitar y renderizar
    const productos = lista.slice(0, MAX_MOSTRAR);
    renderRecientes(productos, carrusel);

    // Mostrar la sección
    seccion.style.display = 'block';
    initCarruselVistos();
});

function renderRecientes(productos, carrusel) {
    carrusel.innerHTML = productos.map(p => {
        const placeholder = window.PLACEHOLDER || '';
        const img = p.imagen || placeholder;
        const unidades = p.unidades || 'piezas';
        return `
        <article class="product-card descubre-card">
            <a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link">
                <div class="product-img">
                    <img src="${img}" alt="${window.escapeHtml ? window.escapeHtml(p.nombre) : p.nombre}" loading="lazy">
                </div>
            </a>
            <div class="product-info">
                <span class="product-brand">${window.escapeHtml ? window.escapeHtml(p.categoria || '') : (p.categoria || '')}</span>
                <h3>
                    <a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link-text">${window.escapeHtml ? window.escapeHtml(p.nombre) : p.nombre}</a>
                </h3>
                <button class="btn-add-cart"
                        data-id="${encodeURIComponent(p.id)}"
                        data-nombre="${window.escapeHtml ? window.escapeHtml(p.nombre) : p.nombre}"
                        data-imagen="${img}"
                        data-unidades="${unidades}">
                    <i class="fa-solid fa-plus"></i> Agregar a cotización
                </button>
            </div>
        </article>
        `;
    }).join('');

    if (window.attachImageFallbacks) {
        window.attachImageFallbacks(carrusel);
    }
}

function initCarruselVistos() {
    const carrusel = document.getElementById('recien-vistos-carrusel');
    const prev = document.querySelector('.vistos-arrow-prev');
    const next = document.querySelector('.vistos-arrow-next');
    if (window.setupCarruselScroll) {
        window.setupCarruselScroll(carrusel, prev, next);
    } else if (carrusel) {
        const desplazar = (dir) => carrusel.scrollBy({ left: dir * carrusel.clientWidth * 0.8, behavior: 'smooth' });
        prev?.addEventListener('click', () => desplazar(-1));
        next?.addEventListener('click', () => desplazar(1));
    }
}
