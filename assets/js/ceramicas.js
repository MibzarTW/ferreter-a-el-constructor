/* ==========================================================
   CERÁMICAS — Supabase
   Página especializada con tipologías de pisos y azulejos
   ========================================================== */

const TIPOLOGIAS = [
    { slug: 'todas',          nombre: 'Todas',            icono: 'fa-solid fa-border-all' },
    { slug: 'marmoles',       nombre: 'Mármoles',         icono: 'fa-solid fa-gem' },
    { slug: 'duelas',         nombre: 'Duelas',           icono: 'fa-solid fa-grip-lines' },
    { slug: 'geometricos',    nombre: 'Geométricos',      icono: 'fa-solid fa-shapes' },
    { slug: 'porcelanato',    nombre: 'Porcelanato',      icono: 'fa-solid fa-mountain' },
    { slug: 'fachaletas',     nombre: 'Fachaletas',       icono: 'fa-solid fa-layer-group' },
    { slug: 'azulejos',       nombre: 'Azulejos',         icono: 'fa-solid fa-th-large' },
    { slug: 'antideslizantes',nombre: 'Antideslizantes',  icono: 'fa-solid fa-shoe-prints' }
];

const HERO_POR_TIPOLOGIA = {
    todas:          '/assets/img/categorias/hero-ceramicas.webp',
    marmoles:       '/assets/img/categorias/hero-ceramicas-marmoles.webp',
    duelas:         '/assets/img/categorias/hero-ceramicas-duelas.webp',
    geometricos:    '/assets/img/categorias/hero-ceramicas-geometricos.webp',
    porcelanato:    '/assets/img/categorias/hero-ceramicas-porcelanato.webp',
    fachaletas:     '/assets/img/categorias/hero-ceramicas-fachaletas.webp',
    azulejos:       '/assets/img/categorias/hero-ceramicas-azulejos.webp',
    antideslizantes:'/assets/img/categorias/hero-ceramicas-antideslizantes.webp'
};

let TODAS_LAS_CERAMICAS = [];

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('ceramicas-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="grid-loading">Cargando cerámicas del catálogo...</p>';

    if (!window.supabaseClient) {
        grid.innerHTML = '<p class="grid-loading">Error: Conexión con Supabase no disponible.</p>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo), subcategorias(nombre, slug)')
            .eq('activo', true)
            .eq('categoria_id', 'CAT-23');

        if (error) throw error;

        TODAS_LAS_CERAMICAS = (data || []).map(window.adaptarProducto);

    } catch (err) {
        console.error('Error cargando cerámicas:', err);
        grid.innerHTML = `<p class="grid-loading">Error al cargar cerámicas: ${window.escapeHtml(err.message)}</p>`;
        return;
    }

    const params = new URLSearchParams(location.search);
    const tipologiaActual = params.get('tipologia') || 'todas';

    renderTipologiasNav(tipologiaActual);
    renderCeramicas(tipologiaActual);
});

function renderTipologiasNav(tipologiaActual) {
    const nav = document.getElementById('tipologias-nav');
    if (!nav) return;

    nav.innerHTML = TIPOLOGIAS.map(t => {
        const count = t.slug === 'todas'
            ? TODAS_LAS_CERAMICAS.length
            : TODAS_LAS_CERAMICAS.filter(p => p.tipologia === t.slug || p.subcategoria_slug === t.slug).length;
        const activa = t.slug === tipologiaActual ? 'active' : '';
        const href = t.slug === 'todas'
            ? '/pages/ceramicas.html'
            : `/pages/ceramicas.html?tipologia=${t.slug}`;
        return `
            <a href="${href}" class="tipologia-item ${activa}">
                <i class="${t.icono}"></i>
                <span class="tipologia-nombre">${t.nombre}</span>
                <span class="tipologia-count">${count} productos</span>
            </a>
        `;
    }).join('');

    const hero = document.querySelector('.ceramicas-hero');
    if (hero) {
        hero.style.setProperty('--hero-img', `url('${HERO_POR_TIPOLOGIA[tipologiaActual] || HERO_POR_TIPOLOGIA.todas}')`);
    }

    const titulo = document.getElementById('ceramicas-titulo');
    const t = TIPOLOGIAS.find(x => x.slug === tipologiaActual);
    if (titulo && t) titulo.textContent = t.nombre;
}

function renderCeramicas(tipologia) {
    const grid = document.getElementById('ceramicas-grid');
    const counter = document.getElementById('ceramicas-count');
    if (!grid) return;

    let lista = tipologia === 'todas'
        ? [...TODAS_LAS_CERAMICAS]
        : TODAS_LAS_CERAMICAS.filter(p => p.tipologia === tipologia || p.subcategoria_slug === tipologia);

    // Ordenar por marca y luego nombre
    lista.sort((a, b) => {
        const marcaA = (a.marca || '').toLowerCase();
        const marcaB = (b.marca || '').toLowerCase();
        if (marcaA !== marcaB) return marcaA.localeCompare(marcaB);
        return (a.nombre || '').localeCompare(b.nombre || '');
    });

    if (counter) counter.textContent = lista.length;

    if (!lista.length) {
        grid.innerHTML = '<p class="grid-loading">No hay cerámicas disponibles en esta tipología todavía.</p>';
        return;
    }

    grid.innerHTML = lista.map(p =>
        window.renderProductCard(p, { esCeramica: true })
    ).join('');

    window.attachImageFallbacks(grid);
}
