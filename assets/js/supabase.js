// assets/js/supabase.js
// Inicialización del cliente de Supabase
(function initSupabase() {
    if (!window.supabase) {
        console.warn('El SDK de Supabase (@supabase/supabase-js) no está disponible en window.supabase.');
        return;
    }
    const config = window.SUPABASE_CONFIG || {
        url: 'https://zpikmusxnaintmpduinr.supabase.co',
        anonKey: 'sb_publishable_oHAdMl_YloMlTxHCDGebIg_JPV8xd-Q'
    };

    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    }
})();
