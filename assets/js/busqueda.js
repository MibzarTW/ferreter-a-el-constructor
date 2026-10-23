/* ==========================================================
   BÚSQUEDA — Supabase
   Filtra productos por nombre, marca o código
   ========================================================== */

const CATEGORIAS_SUGERIDAS = [
    { slug: 'herramientas', nombre: 'Herramientas' },
    { slug: 'materiales',   nombre: 'Materiales' },
    { slug: 'pinturas',     nombre: 'Pinturas' },
    { slug: 'electricidad', nombre: 'Electricidad' },
    { slug: 'fontaneria',   nombre: 'Fontanería' },
    { slug: 'ceramicas',    nombre: 'Cerámicas' },
    { slug: 'hogar',        nombre: 'Hogar' }
];

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const query = (params.get('q') || '').trim();

    const input = document.getElementById('busqueda-input');
    const titulo = document.getElementById('busqueda-titulo');
    const subtitulo = document.getElementById('busqueda-subtitulo');
    const grid = document.getElementById('resultados-grid');
    const sinResultados = document.getElementById('sin-resultados');
    const sugerencias = document.getElementById('sugerencias');

    // Prellenar el input con la búsqueda actual
    if (input) input.value = query;

    // Buscar con Enter
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const v = input.value.trim();
                if (v) location.href = `/pages/busqueda.html?q=${encodeURIComponent(v)}`;
            }
        });
    }

    document.getElementById('busqueda-btn')?.addEventListener('click', () => {
        const v = input?.value.trim();
        if (v) location.href = `/pages/busqueda.html?q=${encodeURIComponent(v)}`;
    });

    // Sin término de búsqueda
    if (!query) {
        if (titulo) titulo.textContent = 'Buscar productos';
        if (subtitulo) subtitulo.textContent = 'Escribe el nombre, marca o código del producto que buscas.';
        if (grid) grid.innerHTML = '';
        return;
    }

    // Estado de carga
    if (titulo) titulo.textContent = `Resultados para "${query}"`;
    if (subtitulo) subtitulo.textContent = 'Buscando en catálogo...';
    if (grid) grid.innerHTML = '<p class="grid-loading">Buscando productos en catálogo...</p>';

    if (!window.supabaseClient) {
        if (grid) grid.innerHTML = '<p class="grid-loading">Error: Conexión a la base de datos no disponible.</p>';
        return;
    }

    try {
        // Búsqueda en Supabase por nombre o código (ILIKE)
        const cleanQuery = query.replace(/[%,]/g, '');
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo)')
            .eq('activo', true)
            .or(`nombre.ilike.%${cleanQuery}%,codigo.ilike.%${cleanQuery}%`)
            .limit(60);

        if (error) throw error;

        const adaptados = (data || []).map(window.adaptarProducto);

        // Sin resultados
        if (!adaptados || adaptados.length === 0) {
            if (subtitulo) subtitulo.textContent = `No encontramos coincidencias para "${query}".`;
            if (grid) grid.innerHTML = '';
            if (sinResultados) sinResultados.style.display = 'block';

            if (sugerencias) {
                sugerencias.innerHTML = CATEGORIAS_SUGERIDAS.map(c =>
                    `<a href="/pages/${c.slug}.html">${window.escapeHtml(c.nombre)}</a>`
                ).join('');
            }
            return;
        }

        // Con resultados
        if (sinResultados) sinResultados.style.display = 'none';
        if (subtitulo) {
            subtitulo.innerHTML = `<strong>${adaptados.length}</strong> producto${adaptados.length === 1 ? '' : 's'} encontrado${adaptados.length === 1 ? '' : 's'}`;
        }

        if (grid) {
            grid.innerHTML = adaptados.map(p =>
                window.renderProductCard(p, {
                    esCeramica: p.categoria_grupo === 'ceramicas'
                })
            ).join('');

            window.attachImageFallbacks(grid);
        }

    } catch (err) {
        console.error('Error buscando productos:', err);
        if (grid) grid.innerHTML = `<p class="grid-loading">Error al procesar la búsqueda: ${window.escapeHtml(err.message)}</p>`;
    }
});
