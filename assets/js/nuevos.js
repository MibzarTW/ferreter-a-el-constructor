/* ==========================================================
   NUEVOS INGRESOS — Supabase
   Productos marcados con nuevo: true
   ========================================================== */

const MAX_NUEVOS = 8;

document.addEventListener('DOMContentLoaded', async () => {
    const seccion = document.getElementById('nuevos-section');
    const carrusel = document.getElementById('nuevos-carrusel');
    if (!seccion || !carrusel) return;

    if (!window.supabaseClient) {
        console.error('Supabase no está disponible para nuevos ingresos.');
        seccion.style.display = 'none';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo)')
            .eq('activo', true)
            .eq('nuevo', true)
            .order('created_at', { ascending: false })
            .limit(MAX_NUEVOS);

        if (error) throw error;

        if (!data || data.length === 0) {
            seccion.style.display = 'none';
            return;
        }

        const productos = data.map(window.adaptarProducto);

        carrusel.innerHTML = productos.map(p =>
            window.renderProductCard(p, {
                esCarrusel: true,
                conBadgeNuevo: true,
                categoriaNombre: p.categoria_nombre || p.marca
            })
        ).join('');

        window.attachImageFallbacks(carrusel);
        seccion.style.display = 'block';
        initCarruselNuevos();

    } catch (err) {
        console.error('Error cargando nuevos productos:', err);
        seccion.style.display = 'none';
    }
});

function initCarruselNuevos() {
    const carrusel = document.getElementById('nuevos-carrusel');
    const prev = document.querySelector('.nuevos-arrow-prev');
    const next = document.querySelector('.nuevos-arrow-next');
    window.setupCarruselScroll(carrusel, prev, next);
}
