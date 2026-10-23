/* ==========================================================
   PRODUCTOS QUE PUEDES ENCONTRAR (DESTACADOS) — Supabase
   ========================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const carrusel = document.getElementById('descubre-carrusel');
    if (!carrusel) return;

    if (!window.supabaseClient) {
        console.error('Supabase no está inicializado.');
        carrusel.innerHTML = '<p class="grid-loading">No se pudo conectar a la base de datos.</p>';
        return;
    }

    carrusel.innerHTML = '<p class="grid-loading">Cargando productos destacados...</p>';

    try {
        // Consultar productos activos (priorizando destacados)
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo)')
            .eq('activo', true)
            .order('destacado', { ascending: false })
            .limit(16);

        if (error) throw error;

        if (!data || data.length === 0) {
            carrusel.innerHTML = '<p class="grid-loading">No hay productos destacados disponibles.</p>';
            return;
        }

        // Adaptar registros y barajar ligeramente para variedad
        const adaptados = data.map(window.adaptarProducto);
        const seleccionados = barajarArray([...adaptados]).slice(0, 12);

        carrusel.innerHTML = seleccionados.map(p =>
            window.renderProductCard(p, {
                esCarrusel: true,
                categoriaNombre: p.categoria_nombre || p.marca
            })
        ).join('');

        window.attachImageFallbacks(carrusel);
        initCarruselControles();

    } catch (err) {
        console.error('Error cargando destacados:', err);
        carrusel.innerHTML = `<p class="grid-loading">Error al cargar productos: ${window.escapeHtml(err.message)}</p>`;
    }
});

function barajarArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initCarruselControles() {
    const carrusel = document.getElementById('descubre-carrusel');
    const prev = document.querySelector('.descubre-arrow-prev');
    const next = document.querySelector('.descubre-arrow-next');
    window.setupCarruselScroll(carrusel, prev, next);
}
