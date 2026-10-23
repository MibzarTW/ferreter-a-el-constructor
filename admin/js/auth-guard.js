// admin/js/auth-guard.js
// Control de acceso y sesión para el panel de administración

(async function () {
    const isLoginPage = location.pathname.endsWith('login.html');

    // Esperar a que el cliente Supabase esté listo
    if (!window.supabaseClient) {
        console.error('Supabase no está disponible.');
        if (!isLoginPage) location.href = '/admin/login.html';
        return;
    }

    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();

        if (error || !session) {
            // Usuario NO autenticado
            if (!isLoginPage) {
                location.href = '/admin/login.html';
                return;
            }
        } else {
            // Usuario SÍ autenticado
            if (isLoginPage) {
                location.href = '/admin/index.html';
                return;
            }

            // Inyectar información del usuario en el topbar
            const userEmail = session.user?.email || 'admin@elconstructor.com';
            const emailEl = document.getElementById('admin-user-email');
            const avatarEl = document.getElementById('admin-user-avatar');

            if (emailEl) emailEl.textContent = userEmail;
            if (avatarEl) avatarEl.textContent = userEmail.charAt(0).toUpperCase();
        }

        // Configurar botón de cerrar sesión
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await window.supabaseClient.auth.signOut();
                location.href = '/admin/login.html';
            });
        }

        // Toggle del menú en móviles
        const menuToggle = document.getElementById('btn-menu-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            // Cerrar al hacer clic fuera en móviles
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            });
        }

    } catch (err) {
        console.error('Error verificando sesión:', err);
        if (!isLoginPage) location.href = '/admin/login.html';
    }
})();

// Helper global para mostrar notificaciones toast en el admin
window.showAdminToast = function (mensaje, tipo = 'success') {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast ${tipo}`;

    let icono = 'fa-solid fa-circle-check';
    if (tipo === 'error') icono = 'fa-solid fa-circle-exclamation';
    if (tipo === 'info') icono = 'fa-solid fa-circle-info';

    toast.innerHTML = `
        <i class="${icono}"></i>
        <span>${window.escapeHtml ? window.escapeHtml(mensaje) : mensaje}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};
