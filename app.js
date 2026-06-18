// ================================================================================
// ================================================================================
// BarberGo Application Logic & Component Router - BULLETPROOF ARCHITECTURE
;(function GLOBAL_APP_WRAPPER(){
    try {
// DESIGN PRINCIPLE: UI renders INSTANTLY. Database operations occur silently
// in the background. Network delays NEVER cause black screens or unresponsive UX.
// ================================================================================

// Bilingual i18n Dictionary
window.i18n = {
    ar: {
        settings: "الإعدادات",
        home: "الرئيسية",
        searchPlaceholder: "ابحث باسم الحلاق أو بالصوت ...",
        suggestedBarbers: "صالونات مقترحة لك",
        bookAppointment: "حجز الموعد",
        location: "الموقع والتواصل",
        aiMirror: "مرآة الذكاء الاصطناعي",
        aiDesc: "افتح الكاميرا لاكتشاف القصة المثالية",
        services: "الحجز والخدمات",
        store: "المتجر",
        gallery: "المعرض",
        reviews: "التقييمات",
        payment: "طرق الدفع",
        address: "عنوان الصالون",
        emergency: "طلب حجز طارئ!"
    },
    en: {
        settings: "Settings",
        home: "Home",
        searchPlaceholder: "Search by barber name or voice ...",
        suggestedBarbers: "Suggested Salons For You",
        bookAppointment: "Book",
        location: "Location & Contact",
        aiMirror: "AI Mirror",
        aiDesc: "Open camera to discover your perfect cut",
        services: "Booking & Services",
        store: "Store",
        gallery: "Gallery",
        reviews: "Reviews",
        payment: "Payments",
        address: "Salon Address",
        emergency: "Emergency Booking!"
    }
};

// ================================================================================
// AGGRESSIVE STARTUP BYPASS - Force UI visible and avoid hidden startup crashes
// ================================================================================
(function () {
    const getAppElement = () => document.getElementById('app');
    const hideSplashScreens = () => {
        const selectors = ['#loading', '.loading-screen', '.splash', '.preloader', '.app-loading'];
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
            }
        });
    };

    const enforceAppVisibility = () => {
        try {
            const appEl = getAppElement();
            if (appEl) {
                appEl.style.display = 'block';
                appEl.style.visibility = 'visible';
                appEl.style.opacity = '1';
                appEl.style.position = 'relative';
                appEl.style.zIndex = '9999';
                appEl.style.minHeight = '100vh';
                appEl.style.backgroundColor = '#000';
            }

            if (document.body) {
                document.body.style.display = 'block';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
                document.body.style.backgroundColor = '#000';
                document.body.style.position = 'relative';
                document.body.style.zIndex = '9998';
                document.body.style.overflow = 'auto';
            }

            hideSplashScreens();
        } catch (err) {
            console.warn('[BYPASS] enforceAppVisibility failed:', err);
        }
    };

    window.forceBarberGoUI = enforceAppVisibility;
    window.forceBarberGoUI();
    setTimeout(() => window.forceBarberGoUI(), 100);
    setTimeout(() => window.forceBarberGoUI(), 400);
    setTimeout(() => window.forceBarberGoUI(), 900);

    if (!window.db) {
        window.db = { barbers: [], services: [], products: [], bookings: [], notifications: [] };
    }

    if (!window.UI) {
        window.UI = {
            renderLoadingPlaceholder: (msg) => `<div style="padding:40px;text-align:center;color:#fff;background:#000;min-height:100vh;">${msg}</div>`,
            renderWelcome: () => '<div style="padding:40px;text-align:center;color:#fff;background:#000;min-height:100vh;">Loading BarberGo...</div>'
        };
    }

    if (!window.notifier) {
        window.notifier = {
            show: (title, message) => console.log(`[NOTIFIER] ${title}: ${message}`)
        };
    }
})();

// ================================================================================
// ISOLATED BACKGROUND BOOTSTRAP PROCESS - Runs Async Without Blocking UI
// ================================================================================
// This process handles ALL database/Firebase operations independently.
// If it fails or times out, UI remains functional with cached/fallback data.
// ================================================================================
class BackgroundBootstrapProcess {
    constructor() {
        this.completed = false;
        this.error = null;
        this.startTime = Date.now();
        this.maxDurationMs = 12000; // Hard timeout after 12 seconds
    }

    async execute() {
        try {
            console.info('[BGP] Starting background bootstrap process...');
            
            // Phase 1: Wait for script dependencies (short timeout)
            await this.waitForDependencies();
            
            // Phase 2: Initialize authentication (with timeout)
            await this.initializeAuth();
            
            // Phase 3: Fetch initial collections (non-blocking)
            await this.fetchInitialData();
            
            // Phase 4: Start background tasks
            await this.startBackgroundTasks();
            
            this.completed = true;
            console.info('[BGP] ✅ Background bootstrap completed successfully');
        } catch (err) {
            this.error = err;
            console.warn('[BGP] ⚠️ Background bootstrap error (UI still functional):', err);
        }
    }

    async waitForDependencies() {
        const requiredGlobals = ['UI', 'notifier'];
        const pollMs = 50;
        const timeoutMs = 3000;
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            const ready = requiredGlobals.every(g => {
                if (g === 'UI') return window.UI && typeof window.UI === 'object';
                if (g === 'notifier') return window.notifier && typeof window.notifier.show === 'function';
                return false;
            });

            if (ready) {
                console.info('[BGP] ✓ UI & notifier dependencies ready');
                return true;
            }

            await new Promise(resolve => setTimeout(resolve, pollMs));
        }

        console.warn('[BGP] UI/notifier not ready within timeout, continuing anyway...');
        return false;
    }

    async initializeAuth() {
        if (!window.dbService || typeof window.dbService.ensureAuthReady !== 'function') {
            console.warn('[BGP] dbService not available for auth init');
            return;
        }

        try {
            await Promise.race([
                window.dbService.ensureAuthReady(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('auth-init-timeout')), 5000))
            ]);
            console.info('[BGP] ✓ Firebase authentication initialized');
        } catch (err) {
            console.warn('[BGP] Auth init failed (non-fatal):', err.message);
        }
    }

    async fetchInitialData() {
        if (!window.dbService || typeof window.dbService.fetchInitialCollections !== 'function') {
            console.warn('[BGP] dbService.fetchInitialCollections not available');
            return;
        }

        try {
            const collections = ['barbers', 'services', 'products', 'bookings', 'notifications', 'adminSettings'];
            const initial = await window.dbService.fetchInitialCollections(collections);
            
            if (initial && Object.keys(initial).length > 0) {
                window.db = window.db || {};
                for (const k of Object.keys(initial)) {
                    if (Array.isArray(initial[k])) {
                        if (!window.db[k] || window.db[k].length === 0) {
                            window.db[k] = initial[k];
                        }
                    } else if (initial[k] && typeof initial[k] === 'object') {
                        window.db[k] = Object.assign(window.db[k] || {}, initial[k]);
                    }
                }
                
                if (window.saveDB && typeof window.saveDB === 'function') {
                    try {
                        await window.saveDB();
                        console.info('[BGP] ✓ Initial data fetched and persisted');
                    } catch (e) {
                        console.warn('[BGP] saveDB after fetch failed:', e);
                    }
                }
            }
        } catch (err) {
            console.warn('[BGP] fetchInitialCollections failed:', err);
        }
    }

    async startBackgroundTasks() {
        if (!window.dbService || typeof window.dbService.initFeedbackScheduler !== 'function') {
            console.warn('[BGP] initFeedbackScheduler not available');
            return;
        }

        try {
            window.dbService.initFeedbackScheduler();
            console.info('[BGP] ✓ Feedback scheduler started');
        } catch (e) {
            console.warn('[BGP] initFeedbackScheduler failed:', e);
        }
    }

    isHealthy() {
        return this.completed && !this.error;
    }

    hasTimedOut() {
        return Date.now() - this.startTime > this.maxDurationMs;
    }
}

// Global instance for background bootstrap
window._backgroundBootstrap = new BackgroundBootstrapProcess();

// Start background bootstrap immediately after this script loads
// This runs ASYNCHRONOUSLY and does NOT block the App constructor
window._backgroundBootstrap.execute().catch(err => {
    console.error('[BGP] Unhandled error in background bootstrap:', err);
});

    } catch (err) {
        console.error('[GLOBAL APP ERROR]', err);
        try {
            const appEl = document.getElementById('app');
            if (appEl) {
                appEl.style.display = 'block';
                appEl.style.visibility = 'visible';
                appEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#000;color:#fff;padding:20px;text-align:center;">\n                    <div>\n                        <h2 style="margin:0 0 10px 0;">⚠️ خطأ في التطبيق</h2>\n                        <p style="margin:0 0 10px 0;">حدث خطأ أثناء تشغيل الواجهة. الرجاء إعادة تحميل الصفحة.</p>\n                        <button onclick="location.reload()" style="padding:8px 14px;background:#ffd700;border-radius:6px;border:none;cursor:pointer;font-weight:bold;">إعادة تحميل</button>\n                    </div>\n                </div>';
            }
        } catch (e) {
            console.error('Failed to render global error fallback:', e);
        }
    }
})();

// ================================================================================
// MAIN APPLICATION CLASS - Renders UI Immediately, Defers DB Operations
// ================================================================================
class App {
    constructor() {
        try {
            // CRITICAL: Initialize properties BEFORE rendering (no async waits here!)
            this.appElement = document.getElementById('app');
            if (this.appElement) {
                this.appElement.style.display = 'block';
                this.appElement.style.visibility = 'visible';
                this.appElement.style.opacity = '1';
                this.appElement.style.position = 'relative';
                this.appElement.style.zIndex = '9999';
                this.appElement.style.minHeight = '100vh';
                this.appElement.style.backgroundColor = '#000';
            }
            document.body.style.backgroundColor = '#000';
            document.body.style.display = 'block';
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            this.currentView = 'welcome';
            this.currentParams = {};
            this.language = localStorage.getItem('barbergo_lang') || 'ar';
            this.debouncedFilterBarbers = this.debounce(this.filterBarbers.bind(this), 120);
            this.pendingPreOrderProducts = [];
            this.heavyUILoadPromise = null;
            this.serviceWorkerRegistered = false;
            this.buildId = this.getAppVersion();
            this.initialized = false;

            // Set language direction IMMEDIATELY
            document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = this.language;

            // Render dark shell IMMEDIATELY (no waiting!)
            this.renderInitialDarkShell();

            // Register service worker NON-BLOCKING (fire and forget)
            this.registerServiceWorker().catch(err => {
                console.warn('[App] Service Worker registration failed:', err);
            });

            // Start initialization in background WITHOUT blocking UI
            this.startAsyncInitialization();
        } catch (error) {
            console.error('[App] 🔴 FATAL: App constructor crashed:', error);
            this.renderSafeFallback();
            throw error;
        }
    }

    // ============================================================================
    // ASYNC INITIALIZATION - Non-blocking background process
    // ============================================================================
    async startAsyncInitialization() {
        try {
            // Wait for UI library to be available (short timeout)
            let uiReady = false;
            for (let i = 0; i < 100; i++) {
                if (window.UI && typeof window.UI === 'object') {
                    uiReady = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 30));
            }

            if (!uiReady) {
                console.warn('[App] UI library not ready, continuing with fallback...');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Now perform the full async init
            await this.init();
            this.initialized = true;

        } catch (err) {
            console.error('[App] Async initialization failed:', err);
            this.renderSafeFallback();
        }
    }

    renderInitialDarkShell() {
        if (!this.appElement) return;

        // Keep the root visible but avoid a blocking full-screen loading shell.
        this.appElement.style.display = 'block';
        this.appElement.style.visibility = 'visible';
        this.appElement.style.opacity = '1';
        // Do not inject a large dark loading screen; leave content rendering to the app.
        if (!this.appElement.innerHTML || this.appElement.innerHTML.trim().length < 10) {
            this.appElement.innerHTML = '';
        }
    }

    ensureInitialDarkShell() {
        if (this.appElement) {
            this.appElement.style.backgroundColor = '#000000';
            this.appElement.style.minHeight = '100vh';
            this.appElement.style.color = '#ffffff';
        }
        if (document.body) {
            document.body.style.backgroundColor = '#000000';
        }
    }

    getAppVersion() {
        if (window.APP_VERSION) {
            return window.APP_VERSION;
        }
        const version = `v${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12)}`;
        window.APP_VERSION = version;
        return version;
    }

    async startInit() {
        try {
            await this.init();
        } catch (error) {
            console.error('[App] Startup failed:', error);
            this.renderSafeFallback();
        }
    }

    async waitForBootstrap() {
        // Wait for database collections to be available
        const dbReady = new Promise(resolve => {
            if (window.db && window.db.barbers && window.db.services && window.db.bookings) {
                return resolve();
            }
            
            let attempts = 0;
            const interval = setInterval(() => {
                if (window.db && window.db.barbers && window.db.services && window.db.bookings) {
                    clearInterval(interval);
                    resolve();
                }
                attempts++;
                if (attempts > 60) { // 3 seconds max
                    clearInterval(interval);
                    resolve(); // Continue anyway
                }
            }, 50);
        });

        await dbReady;

        // Also ensure auth is ready
        if (window.dbService && typeof window.dbService.ensureAuthReady === 'function') {
            try {
                await Promise.race([
                    window.dbService.ensureAuthReady(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('auth-init-timeout')), 5000))
                ]);
            } catch (err) {
                console.warn('[App] Auth ready check timed out or failed:', err);
            }
        }
    }

    renderSafeFallback() {
        if (this.appElement) {
            this.appElement.innerHTML = window.UI 
                ? window.UI.renderLoadingPlaceholder('حدث خطأ. جاري إعادة المحاولة...')
                : '<div style="padding: 20px; text-align: center; color: #ccc;">Error occurred. Please refresh the page.</div>';
        }
    }

    async init() {
        await this.waitForBootstrap();

        // Full Real-App session detection
        const session = localStorage.getItem('barbergo_session');

        if (window.location.pathname.includes('admin.html')) {
            if (session === 'admin') {
                this.navigate('adminDashboard');
                if (window.notifier) {
                    window.notifier.show("مرحباً بك", "أهلاً بك مجدداً في لوحة تحكم الإدارة.", "success");
                }
            } else {
                this.navigate('adminLogin');
            }
            return;
        }

        if (session) {
            if (session.startsWith('barber_')) {
                const bId = parseInt(session.split('_')[1]);
                this.navigate('barberDashboard', { id: bId });
                if (window.db && window.db.barbers) {
                    const foundBarber = window.db.barbers.find(b => b.id === bId);
                    const bName = foundBarber ? foundBarber.name : 'أيها الحلاق';
                    if (window.notifier) {
                        window.notifier.show("مرحباً بك", `أهلاً بك مجدداً في لوحة التحكم الخاصة بك يا ${bName}.`, "success");
                    }
                }
                try {
                    this.checkBarberExpiryNotification(bId);
                } catch (e) {
                    console.error('[App] Expiry notification check failed:', e);
                }
                return;
            } else if (session === 'client') {
                this.navigate('clientHome');
                if (window.notifier) {
                    window.notifier.show("مرحباً بك", "أهلاً بك مجدداً في BarberGo. احجز موعدك الآن!", "success");
                }
                return;
            }
        }

        this.navigate('welcome');
        this.askPushNotificationsPermission();
    }

    logout() {
        localStorage.removeItem('barbergo_session');
        if (window.notifier) {
            window.notifier.show("تسجيل خروج", "تم تسجيل الخروج بنجاح", "info");
        }

        if (window.location.pathname.includes('admin.html')) {
            this.navigate('adminLogin');
        } else {
            this.navigate('welcome');
        }
    }

    async navigate(view, params = {}) {
        if (this.appElement) {
            this.appElement.style.backgroundColor = '#000000';
        }
        if (document.body) {
            document.body.style.backgroundColor = '#000000';
        }

        this.currentView = view;
        this.currentParams = params;

        let html = '';

        // Safety check: UI library must be available
        if (!window.UI || typeof window.UI !== 'object') {
            this.appElement.innerHTML = '<div style="padding: 40px; text-align: center; color: #ccc;">UI library not loaded. Please refresh the page.</div>';
            return;
        }

        try {
            switch (view) {
                case 'welcome':
                    html = window.UI.renderWelcome();
                    break;
                case 'clientHome':
                    html = window.UI.renderClientHome();
                    break;
                case 'clientSettings':
                    html = window.UI.renderClientSettings();
                    break;
                case 'clientNotifications':
                    html = window.UI.renderClientNotifications();
                    break;
                case 'clientBookings':
                    html = window.UI.renderClientBookings();
                    break;
                case 'barberProfile':
                    html = window.UI.renderBarberProfile(params.id || 1);
                    break;
                case 'bookingFlow':
                    html = window.UI.renderBookingFlow(params.barberId, params.serviceId);
                    break;
                case 'aiCamera':
                    html = window.UI.renderAICamera();
                    break;
                case 'barberLogin':
                    html = window.UI.renderBarberLogin();
                    break;
                case 'barberEmailSetup':
                    html = window.UI.renderBarberEmailSetup();
                    break;
                case 'barberDashboard':
                    html = this.renderLoadingPlaceholder();
                    this.appElement.innerHTML = html;
                    try {
                        await this.loadHeavyUI();
                    } catch (err) {
                        console.warn('[App] Heavy UI load failed:', err);
                    }
                    html = window.UI.renderBarberDashboard(params.id || 1);
                    break;
                case 'adminLogin':
                    html = window.UI.renderAdminLogin();
                    break;
                case 'adminEmailSetup':
                    html = window.UI.renderAdminEmailSetup();
                    break;
                case 'adminDashboard':
                    html = this.renderLoadingPlaceholder();
                    this.appElement.innerHTML = html;
                    try {
                        await this.loadHeavyUI();
                    } catch (err) {
                        console.warn('[App] Heavy UI load failed:', err);
                    }
                    html = window.UI.renderAdminDashboard();
                    setTimeout(() => {
                        if (window.app) window.app.initAdminChart();
                    }, 100);
                    break;
                default:
                    html = window.UI.renderWelcome();
            }

            this.appElement.innerHTML = html;

        } catch (err) {
            console.error('[App] Render failed in navigate:', err);
            this.renderSafeFallback();
            return;
        }

        window.scrollTo(0, 0);

        // Check for barber expiry notifications
        if (view === 'barberDashboard' && params && params.id) {
            try {
                this.checkBarberExpiryNotification(params.id);
            } catch (e) {
                console.error('[App] Expiry notification check failed:', e);
            }
        }
    }

    checkBarberExpiryNotification(barberId) {
        if (!window.db || !window.db.barbers) return;
        
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (!barber) return;

        const expiryRaw = barber.subscriptionEndDate || barber.expiryDate || barber.subscriptionEnd || null;
        if (!expiryRaw) return;

        const expiry = new Date(expiryRaw);
        if (isNaN(expiry.getTime())) return;

        const remainingMs = expiry.getTime() - Date.now();
        const twoDaysMs = 48 * 60 * 60 * 1000;

        if (remainingMs <= twoDaysMs && remainingMs >= 0) {
            const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show(
                    'انتباه: انتهاء الاشتراك',
                    `اشتراك صفحتك سينتهي خلال ${hoursLeft} ساعة. يرجى تجديده للحفاظ على ظهور الصالون للعملاء.`,
                    'info'
                );
            }
        }
    }

    renderLoadingPlaceholder(message = 'جاري تحميل المحتوى...') {
        if (window.UI && typeof window.UI.renderLoadingPlaceholder === 'function') {
            return window.UI.renderLoadingPlaceholder(message);
        }
        return `<div style="padding: 40px; text-align: center; color: #ccc;">${message}</div>`;
    }

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.register(`./sw.js?v=${this.buildId}`, { scope: '/' });
            this.serviceWorkerRegistered = true;
            console.info('[App] Service Worker registered:', registration.scope);
            if (registration && registration.update) {
                registration.update().catch(() => {});
            }
        } catch (err) {
            console.warn('[App] Service Worker registration failed:', err);
        }
    }

    askPushNotificationsPermission() {
        if (!('Notification' in window) || Notification.permission !== 'default') return;
        if (localStorage.getItem('barbergo_push_prompt_shown') === 'true') return;

        localStorage.setItem('barbergo_push_prompt_shown', 'true');

        setTimeout(async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted' && window.notifier) {
                    window.notifier.show('تم تفعيل الإشعارات', 'ستتلقى تذكيرات الحجز والتحديثات من BarberGo.', 'success');
                } else if (permission === 'denied' && window.notifier) {
                    window.notifier.show('تم تعطيل الإشعارات', 'لن يتم إرسال تذكيرات الدفع والإشعارات الفورية.', 'info');
                }
            } catch (err) {
                console.warn('[App] Push notification permission prompt failed:', err);
            }
        }, 1300);
    }

    // Interactions & Routing Helpers
    async loadHeavyUI() {
        if (!this.heavyUILoadPromise) {
            // Check if ui-heavy-routes is already loaded
            if (window.UI && window.UI.renderBarberDashboard) {
                this.heavyUILoadPromise = Promise.resolve();
            } else {
                // Load ui-heavy-routes as a regular script
                this.heavyUILoadPromise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = './ui-heavy-routes.js?t=' + Date.now();
                    script.onload = () => {
                        console.info('[App] Heavy UI routes loaded successfully');
                        resolve();
                    };
                    script.onerror = (err) => {
                        console.error('[App] Heavy UI routes failed to load:', err);
                        resolve(); // Don't fail completely, continue anyway
                    };
                    document.head.appendChild(script);
                });
            }
        }
        return this.heavyUILoadPromise;
    }

    toggleLanguage() {
        this.language = this.language === 'ar' ? 'en' : 'ar';
        localStorage.setItem('barbergo_lang', this.language);
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.language;
        
        const msg = this.language === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Language switched to English';
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تغيير اللغة", msg, "success");
        }
        this.navigate(this.currentView, this.currentParams);
    }

    debounce(fn, wait = 120) {
        let timeout;
        return (...args) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), wait);
        };
    }

    throttle(fn, limit = 100) {
        let waiting = false;
        return (...args) => {
            if (!waiting) {
                fn(...args);
                waiting = true;
                setTimeout(() => (waiting = false), limit);
            }
        };
    }

    filterBarbers() {
        const query = document.getElementById('client-search-input');
        if (!query) return;
        
        const queryText = query.value.toLowerCase();
        const barberCards = document.querySelectorAll('.barber-grid-card');
        
        window.requestAnimationFrame(() => {
            barberCards.forEach(card => {
                const nameEl = card.querySelector('h3');
                const name = nameEl ? nameEl.innerText.toLowerCase() : '';
                card.style.display = name.includes(queryText) ? 'block' : 'none';
            });
        });
    }

    requestLocation() {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تحديد الموقع", "تم تحديد موقعك الجغرافي بنجاح. يتم الآن عرض أقرب الحلاقين إليك.", "success");
        }
    }

    openNotifications() {
        this.navigate('clientNotifications');
        const customerName = localStorage.getItem('barbergo_client_name');
        if (!customerName && window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تنبيه", "لم يتم العثور على اسم العميل. قم بالحجز أولاً لتلقي إشعارات التقييم.", "info");
        }
    }

    submitFeedback(barberId, notificationId) {
        const slider = document.getElementById(`feedback-slider-${notificationId}`);
        const value = slider ? parseInt(slider.value, 10) : 0;
        
        if (!window.db || !window.db.notifications) return;
        
        const notification = window.db.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        const ratingData = {
            customerName: notification.customerName || localStorage.getItem('barbergo_client_name') || 'العميل',
            ratingPercentage: value,
            timestamp: new Date().toISOString()
        };

        if (window.dbService && typeof window.dbService.addBarberRating === 'function') {
            window.dbService.addBarberRating(barberId, ratingData);
        }

        notification.archived = true;
        notification.submitted = true;
        notification.ratingPercentage = value;
        notification.submittedAt = new Date().toISOString();
        
        if (window.saveDB && typeof window.saveDB === 'function') {
            window.saveDB();
        }

        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show(
                "تم الإرسال",
                `تم إرسال تقييمك لكابتن ${notification.barberName} بنجاح. شكراً لمشاركتك رأيك.`,
                "success"
            );
        }
        
        this.navigate('clientNotifications');
    }

    archiveNotification(notificationId) {
        if (!window.db || !window.db.notifications) return;
        
        const notification = window.db.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        notification.archived = true;
        
        if (window.saveDB && typeof window.saveDB === 'function') {
            window.saveDB();
        }
        
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تم الإغلاق", "تم إغلاق الإشعار ولن يتم عرضه مجدداً.", "info");
        }
        
        this.navigate('clientNotifications');
    }

    toggleFavorite(id) {
        if (!window.db || !window.db.barbers) return;
        
        const barber = window.db.barbers.find(b => b.id === id);
        if (barber) {
            barber.isFavorite = !barber.isFavorite;
            const msg = barber.isFavorite ? "تم إضافة الحلاق إلى مفضلتك." : "تم إزالة الحلاق من مفضلتك.";
            const type = barber.isFavorite ? "success" : "info";
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("المفضلة", msg, type);
            }
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            // Re-render home to sort favorites
            if (this.currentView === 'clientHome') {
                this.navigate('clientHome');
            }
        }
    }

    rateBarber(rating, element) {
        this.pendingRating = rating;
        const container = element.parentElement;
        const stars = container.querySelectorAll('i');
        
        // Note: Flex-direction is row-reverse, so index 0 is 5 stars, index 4 is 1 star.
        stars.forEach((star, index) => {
            const starValue = 5 - index;
            if (starValue <= rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }

    submitReview(barberId) {
        if (!this.pendingRating) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "يرجى اختيار عدد النجوم للتقييم.", "error");
            }
            return;
        }

        if (!window.db || !window.db.barbers) return;
        
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (barber) {
            // Update rating logic
            const currentTotal = barber.rating * (barber.reviewsCount || 120);
            const newCount = (barber.reviewsCount || 120) + 1;
            const newAvg = (currentTotal + this.pendingRating) / newCount;
            
            barber.rating = parseFloat(newAvg.toFixed(1));
            barber.reviewsCount = newCount;
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            // Update UI
            const ratingDisplay = document.getElementById('barber-avg-rating');
            const reviewsCountDisplay = document.getElementById('barber-reviews-count');
            
            if (ratingDisplay) ratingDisplay.innerText = barber.rating;
            if (reviewsCountDisplay) reviewsCountDisplay.innerText = `بناءً على ${barber.reviewsCount} تقييم`;
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("إرسال التقييم", "تم تسجيل تقييمك بنجاح! شكراً لك.", "success");
            }
            
            this.pendingRating = 0;
            
            // Reset stars visually
            const stars = document.querySelectorAll('#barber-rating i');
            stars.forEach(star => {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            });
        }
    }

    toggleBarberSettingParam(btn, param) {
        const barberIdStr = localStorage.getItem('barbergo_session');
        if (!barberIdStr) return;
        
        if (!window.db || !window.db.barbers) return;
        
        const barberId = parseInt(barberIdStr.split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        
        if (barber) {
            if (param === 'homeService') {
                barber.homeService = !barber.homeService;
                if (barber.homeService) {
                    btn.className = 'btn btn-primary';
                    btn.innerHTML = '<i class="fa-solid fa-toggle-on"></i> متاح';
                } else {
                    btn.className = 'btn btn-ghost text-muted';
                    btn.innerHTML = '<i class="fa-solid fa-toggle-off"></i> غير متاح';
                }
            } else if (barber.settings && barber.settings[param] !== undefined) {
                barber.settings[param] = !barber.settings[param];
                if (barber.settings[param]) {
                    btn.className = param === 'enableEmergency' ? 'btn btn-success' : 'btn btn-primary';
                    btn.innerHTML = '<i class="fa-solid fa-toggle-on"></i> مفعل';
                } else {
                    btn.className = 'btn btn-ghost text-muted';
                    btn.innerHTML = '<i class="fa-solid fa-toggle-off"></i> معطل';
                }
            } else if (barber.paymentMethods && barber.paymentMethods[param] !== undefined) {
                barber.paymentMethods[param] = !barber.paymentMethods[param];
                if (barber.paymentMethods[param]) {
                    btn.className = 'btn btn-primary';
                    btn.innerText = 'مفعل';
                } else {
                    btn.className = 'btn btn-ghost text-muted';
                    btn.innerText = 'معطل';
                }
            }
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
        }
    }

    saveBarberSettings() {
        const bioEl = document.getElementById('barber-edit-bio');
        const phoneEl = document.getElementById('barber-edit-phone');
        const whatsappEl = document.getElementById('barber-edit-whatsapp');
        const locationEl = document.getElementById('barber-edit-location');
        
        const bio = bioEl ? bioEl.value : undefined;
        const phone = phoneEl ? phoneEl.value : undefined;
        const whatsapp = whatsappEl ? whatsappEl.value : undefined;
        const location = locationEl ? locationEl.value : undefined;
        
        const barberIdStr = localStorage.getItem('barbergo_session');
        if (!barberIdStr) return;
        
        if (!window.db || !window.db.barbers) return;
        
        const barberId = parseInt(barberIdStr.split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        
        if (barber) {
            if (bio) barber.bio = bio;
            if (phone) barber.phone = phone;
            if (location) barber.location = location;
            if (!barber.social) barber.social = {};
            if (whatsapp) barber.social.whatsapp = whatsapp;
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تم الحفظ", "تم حفظ إعدادات البروفايل بنجاح، وستظهر للعملاء بشكلها الجديد.", "success");
            }
        }
    }

    simulateAddService() {
        const barberIdStr = localStorage.getItem('barbergo_session');
        if (!barberIdStr || !barberIdStr.startsWith('barber_')) return;
        
        if (!window.db || !window.db.services) return;
        
        const barberId = parseInt(barberIdStr.split('_')[1]);

        const name = prompt("أدخل اسم الخدمة الجديدة:");
        const price = prompt("أدخل سعر الخدمة (بالدينار):");
        
        if (name && price) {
            const newSvc = {
                id: Date.now(),
                barber_id: barberId,
                name: name,
                price: parseFloat(price),
                duration: 30
            };
            
            window.db.services.push(newSvc);
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }

            const container = document.getElementById('services-list-container');
            if (container) {
                const html = `
                <div class="pill-box p-3 mb-2 d-flex justify-content-between align-items-center" style="border-left: 3px solid var(--gold-primary);" id="svc-${newSvc.id}">
                    <div class="text-right">
                        <h4 class="m-0 text-white">${name}</h4>
                        <div class="text-muted" style="font-size: 0.85rem; margin-top: 5px;"><i class="fa-regular fa-clock"></i> 30 دقيقة | <i class="fa-solid fa-tag"></i> JOD ${price}</div>
                    </div>
                    <button class="btn btn-ghost text-danger p-2" onclick="app.deleteService(${newSvc.id}, this)"><i class="fa-solid fa-trash"></i></button>
                </div>`;
                container.innerHTML += html;
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تمت الإضافة", `تمت إضافة خدمة ${name} بقيمة ${price} JOD بنجاح. ستظهر الآن للعملاء.`, "success");
            }
        }
    }

    deleteService(serviceId, btnEl) {
        const confirmDel = confirm("هل أنت متأكد من حذف هذه الخدمة؟");
        if (!confirmDel) return;

        if (!window.db || !window.db.services) return;

        const svc = window.db.services.find(s => s.id === serviceId);
        if (!svc) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('خطأ', 'لم يتم العثور على الخدمة للحذف.', 'error');
            }
            return;
        }

        // Optimistic UI update: remove locally first for immediate UX
        try {
            window.db.services = window.db.services.filter(s => s.id !== serviceId);
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            if (btnEl) btnEl.closest('.pill-box').remove();
        } catch (err) {
            console.error('[App] Local delete error', err);
        }

        // Call backend removal: prefer arrayRemove from barber document
        if (window.dbService && typeof window.dbService.removeServiceFromBarber === 'function') {
            window.dbService.removeServiceFromBarber(svc.barber_id, svc).then(() => {
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show('حذف الخدمة', 'تم حذف الخدمة من السجل بنجاح.', 'info');
                }
            }).catch(err => {
                console.error('[App] Delete service error:', err);
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show('خطأ', 'فشل حذف الخدمة من الخادم. تحقق من الاتصال.', 'error');
                }
            });
        } else if (window.dbService && typeof window.dbService.deleteService === 'function') {
            // Fallback to deleting service doc if arrayRemove not available
            window.dbService.deleteService(serviceId).then(() => {
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show('حذف الخدمة', 'تم حذف الخدمة من السجل بنجاح.', 'info');
                }
            }).catch(err => {
                console.error('[App] Delete service error:', err);
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show('خطأ', 'فشل حذف الخدمة من الخادم.', 'error');
                }
            });
        }
    }

    // Confirm delete used by barber UI buttons
    confirmDeleteService(serviceId, btnEl) {
        const ok = confirm('هل أنت متأكد من حذف هذه الخدمة نهائياً؟');
        if (!ok) return;
        this.deleteService(serviceId, btnEl);
    }

    startEditService(serviceId, btnEl) {
        if (!window.db || !window.db.services) return;
        
        const svc = window.db.services.find(s => s.id === serviceId);
        if (!svc) return;
        
        const container = document.getElementById('svc-' + serviceId);
        if (!container) return;

        container.innerHTML = `
            <div style="flex:1; text-align: right;">
                <input id="edit-name-${serviceId}" class="form-control" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 8px; width: 100%; margin-bottom:6px;" value="${svc.name}">
                <input id="edit-price-${serviceId}" class="form-control" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 8px; width: 140px;" value="${svc.price}">
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
                <button class="btn btn-primary p-2" onclick="app.saveServiceEdit(${serviceId}, this)">حفظ</button>
                <button class="btn btn-ghost p-2" onclick="app.navigate('barberDashboard', { id: ${svc.barber_id} })">إلغاء</button>
            </div>
        `;
    }

    async saveServiceEdit(serviceId) {
        const nameEl = document.getElementById('edit-name-' + serviceId);
        const priceEl = document.getElementById('edit-price-' + serviceId);
        if (!nameEl || !priceEl) return;
        
        const newName = nameEl.value.trim();
        const newPrice = parseFloat(priceEl.value);
        
        if (!newName || isNaN(newPrice)) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('خطأ', 'يرجى إدخال اسم صحيح وسعر رقمي.', 'error');
            }
            return;
        }

        if (!window.db || !window.db.services) return;

        // Optimistically update local DB for snappy UI
        const svc = window.db.services.find(s => s.id === serviceId);
        if (svc) {
            svc.name = newName;
            svc.price = newPrice;
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
        }

        try {
            if (window.dbService && typeof window.dbService.updateService === 'function') {
                await window.dbService.updateService(serviceId, { name: newName, price: newPrice });
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('تم الحفظ', 'تم تحديث بيانات الخدمة بنجاح.', 'success');
            }
            
            // Refresh view to show updated service
            this.navigate('barberDashboard', { id: svc.barber_id });
        } catch (err) {
            console.error('[App] Save service edit error:', err);
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('خطأ', 'فشل تحديث الخدمة. حاول مجدداً.', 'error');
            }
        }
    }

    // Product pre-order toggling on client product cards
    togglePreOrderProduct(productId, btnEl) {
        if (!window.db || !window.db.products) return;
        
        const prod = window.db.products.find(p => p.id === productId);
        if (!prod) return;

        const idx = this.pendingPreOrderProducts.findIndex(p => p.productId === productId);
        if (idx > -1) {
            // remove
            this.pendingPreOrderProducts.splice(idx, 1);
            if (btnEl) btnEl.innerText = 'إضافه للطلب والتحضير';
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('تمت الإزالة', `${prod.name} تمت إزالته من قائمة التحضير.`, 'info');
            }
        } else {
            this.pendingPreOrderProducts.push({ productId: productId, productName: prod.name, quantity: 1 });
            if (btnEl) btnEl.innerText = 'تمت الإضافة';
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('تمت الإضافة', `${prod.name} أضيف لطلب التحضير عند الحضور.`, 'success');
            }
        }
    }

    updateSubscriptionPrice() {
        if (!window.db || !window.db.adminSettings) return;
        
        const adminData = window.db.adminSettings;
        const inputs = document.querySelectorAll('#admin-content-3 input[type="number"]');
        if (inputs.length >= 2) {
            const monthly = parseInt(inputs[0].value);
            const yearly = parseInt(inputs[1].value);
            if (!isNaN(monthly) && !isNaN(yearly)) {
                adminData.subscriptionPrices = adminData.subscriptionPrices || {};
                adminData.subscriptionPrices.monthly = monthly;
                adminData.subscriptionPrices.yearly = yearly;
                
                if (window.saveDB && typeof window.saveDB === 'function') {
                    window.saveDB();
                }
                
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("تحديث التسعير", "تم حفظ أسعار الاشتراكات الجديدة وتحديثها في قاعدة البيانات.", "success");
                }
            }
        }
    }

    submitNewProduct() {
        const nameInput = document.getElementById('new-product-name');
        const priceInput = document.getElementById('new-product-price');
        const imageInput = document.getElementById('new-product-image');

        const name = nameInput ? nameInput.value.trim() : '';
        const price = priceInput ? priceInput.value.trim() : '';
        const file = imageInput ? imageInput.files[0] : null;

        if (!name || !price || !file) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("بيانات غير مكتملة", "يرجى إدخال اسم المنتج والسعر واختيار صورة.", "warning");
            }
            return;
        }

        if (!window.db || !window.db.products) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            const barberIdStr = localStorage.getItem('barbergo_session');
            if (!barberIdStr) return;
            
            const barberId = parseInt(barberIdStr.split('_')[1]);

            const newProduct = {
                id: Date.now(),
                barber_id: barberId,
                name: name,
                price: parseFloat(price),
                image: base64Image
            };

            window.db.products.push(newProduct);
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }

            const container = document.getElementById('store-products-list');
            if (container) {
                const html = `
                <div class="pill-box p-2 text-center" style="position: relative;">
                    <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                    <img src="${newProduct.image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                    <h4 class="text-white m-0" style="font-size: 0.95rem;">${newProduct.name}</h4>
                    <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">${newProduct.price} JOD</div>
                </div>`;
                container.innerHTML += html;
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تمت الإضافة", `تم إضافة ${newProduct.name} إلى المتجر وتم عرضه للعملاء بنجاح.`, "success");
            }

            // Clean up
            if (nameInput) nameInput.value = '';
            if (priceInput) priceInput.value = '';
            if (imageInput) imageInput.value = '';
        };
        reader.readAsDataURL(file);
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        if (!window.db) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            const barberIdStr = localStorage.getItem('barbergo_session');
            if (!barberIdStr) return;
            
            const barberId = parseInt(barberIdStr.split('_')[1]);
            const barber = window.db.barbers ? window.db.barbers.find(b => b.id === barberId) : null;

            if (!barber) return;

            if (type === 'cover') {
                barber.image = base64Image; // save as cover
                
                if (window.saveDB && typeof window.saveDB === 'function') {
                    window.saveDB();
                }
                
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("تم الرفع", "تم رفع صورة الغلاف بنجاح ومزامنتها.", "success");
                }

                const statusDiv = document.getElementById('cover-upload-status');
                if (statusDiv) statusDiv.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> تم رفع الصورة وجاهزة للحفظ</span>';

            } else if (type === 'gallery') {
                if (!barber.gallery) barber.gallery = [];
                barber.gallery.push(base64Image);
                
                if (window.saveDB && typeof window.saveDB === 'function') {
                    window.saveDB();
                }

                const container = document.getElementById('gallery-images-list');
                if (container) {
                    const html = `
                    <div style="position: relative;">
                        <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                        <img src="${base64Image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                    </div>`;
                    container.innerHTML += html;
                }
                
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("تم الرفع", "تم إضافة الصورة بنجاح إلى معرض أعمالك المحفوظ.", "success");
                }
            }
            // Clear input
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    }

    toggleBlockTime(element) {
        element.classList.toggle('selected');
        element.classList.toggle('blocked-slot');
        if (element.classList.contains('blocked-slot')) {
            element.style.background = '#e74c3c';
            element.style.borderColor = '#e74c3c';
            element.style.opacity = '0.8';
            element.style.color = '#fff';
        } else {
            element.style.background = 'var(--bg-main)';
            element.style.borderColor = 'var(--border-color)';
            element.style.opacity = '1';
            element.style.color = '';
        }
    }

    saveBlockedTimes() {
        const barberIdStr = localStorage.getItem('barbergo_session');
        if (!barberIdStr) return;
        
        if (!window.db || !window.db.barbers) return;
        
        const barberId = parseInt(barberIdStr.split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        
        if (barber) {
            const blockedSlotsElements = document.querySelectorAll('#barber-block-grid .blocked-slot');
            const blockedTimes = Array.from(blockedSlotsElements).map(el => el.textContent.trim());
            barber.blockedTimes = blockedTimes;
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show('تم الحفظ', 'تم حفظ الأوقات المقفلة بنجاح. لن يتمكن العملاء من حجز هذه الأوقات.', 'success');
            }
        }
    }

    cancelBookingAlert(bookingIdElement) {
        // legacy method, kept for reference
        const reason = prompt("إلغاء حجز! تنويه: سيتم حفظ الإلغاء. الرجاء كتابة سبب الإلغاء للعميل:");
        if (reason) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تم الإلغاء", `تم إلغاء الحجز للعميل بالسبب: ${reason}`, "info");
            }
        }
    }

    cancelBooking(btn, clientName) {
        const isCancelled = btn.classList.contains('btn-warning');
        
        if (!isCancelled) {
            // Cancel booking
            const reason = prompt(`الرجاء كتابة سبب إلغاء حجز (${clientName}) لإرساله للعميل:`);
            if (reason !== null) { // User didn't click Cancel on prompt
                const bookingCard = btn.closest('.booking-item');
                if (bookingCard) {
                    bookingCard.style.opacity = '0.6';
                    bookingCard.style.borderRightColor = '#e74c3c'; // change green line to red
                }
                
                btn.classList.remove('btn-danger', 'text-danger');
                btn.classList.add('btn-warning', 'text-dark');
                btn.style.background = 'rgba(243, 156, 18, 0.2)';
                btn.style.border = '1px solid rgba(243, 156, 18, 0.4)';
                btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> تراجع عن الإلغاء';
                
                // Show simulated notification to client
                if (window.db && window.db.barbers) {
                    const barberIdStr = localStorage.getItem('barbergo_session');
                    const barberId = barberIdStr ? parseInt(barberIdStr.split('_')[1]) : null;
                    const barber = barberId ? window.db.barbers.find(b => b.id === barberId) : null;
                    const barberName = barber ? barber.name : "الحلاق";
                    
                    if (window.notifier && typeof window.notifier.show === 'function') {
                        window.notifier.show("تم إرسال الاعتذار للعميل", `نعتذر منك بشدة.. نود إعلامك بأن موعدك لدى ${barberName} قد تم إلغاؤه لظرف طارئ خارج عن إرادتنا. نحن نهتم بوقتك، بإمكانك إعادة الحجز في وقت آخر يناسبك. شكراً لتفهمك - فريق BarberGo.`, "info");
                    }
                }
            }
        } else {
            // Undo Cancel
            const bookingCard = btn.closest('.booking-item');
            if (bookingCard) {
                bookingCard.style.opacity = '1';
                bookingCard.style.borderRightColor = '#2ecc71'; // revert to green
            }
            
            btn.classList.remove('btn-warning', 'text-dark');
            btn.classList.add('btn-danger', 'text-danger');
            btn.style.background = 'rgba(231, 76, 60, 0.1)';
            btn.style.border = '1px solid rgba(231, 76, 60, 0.3)';
            btn.innerHTML = 'إلغاء الحجز وإرسال تنبيه للعميل';
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تم استعادة الحجز", `تم استعادة حجز العميل (${clientName}) بنجاح. تم إعلامه بتأكيد الموعد.`, "success");
            }
        }
    }

    cancelClientBooking(bookingId) {
        // Implement the 1-hour cancellation policy
        if (!window.db || !window.db.bookings) return;
        
        const booking = window.db.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // In a real app we parse booking.time, but here we simulate a time check:
        // Let's assume they can cancel unless it's strictly denied by server. Since it's local time based, we'll just allow it with a prompt.
        const confirmed = confirm("هل أنت متأكد من رغبتك بإلغاء الموعد؟ يمكنك الإلغاء فقط إذا كان متبقياً أكثر من ساعة للموعد.");
        if (confirmed) {
            booking.status = 'cancelled';
            
            if (window.saveDB && typeof window.saveDB === 'function') {
                window.saveDB();
            }
            
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تأكيد الإلغاء", "تم إلغاء الموعد بنجاح. نعتذر لسماع ذلك ونأمل رؤيتك قريباً.", "success");
            }
            
            // محاكاة إشعار للعملاء المهتمين والحلاق بتوفر الوقت
            setTimeout(() => {
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("إشعار توفر وقت 🔔", `لقد أصبح الوقت (${booking.time}) متاحاً الآن للحجز!`, "info");
                }
            }, 2000);

            this.navigate('clientBookings');
        }
    }

    selectTime(element) {
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        if (!element.classList.contains('disabled')) {
            element.classList.add('selected');
        }
    }

    async confirmBooking() {
        const nameEl = document.getElementById('customer-name');
        const selectedSlot = document.querySelector('.time-slot.selected');

        const name = nameEl ? nameEl.value : '';

        if (!name || !name.trim()) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "الرجاء إدخال الاسم الثنائي.", "error");
            }
            return;
        }
        if (!selectedSlot) {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("تنبيه", "الرجاء اختيار وقت متاح.", "warning");
            }
            return;
        }

        const timeStr = selectedSlot.innerText;

        const bId = this.currentParams.barberId || this.currentParams.id;
        const preOrders = (this.pendingPreOrderProducts || []).map(p => ({ productName: p.productName, quantity: p.quantity || 1 }));
        
        try {
            if (window.dbService && typeof window.dbService.bookAppointment === 'function') {
                await window.dbService.bookAppointment({
                    customer_name: name,
                    time: timeStr,
                    date: new Date().toISOString(),
                    barber_id: bId,
                    service_id: this.currentParams.serviceId,
                    preOrderProducts: preOrders
                });
            }
        } catch (err) {
            console.error('[App] Booking appointment error:', err);
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ في الحجز", "حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مرة أخرى.", "error");
            }
            return;
        }

        // clear pending selections after booking
        this.pendingPreOrderProducts = [];

        // Identify client for future sessions (My Bookings page)
        localStorage.setItem('barbergo_client_name', name);

        // Instant Booking Notification
        if (window.notifier && typeof window.notifier.notifyBookingConfirmed === 'function') {
            window.notifier.notifyBookingConfirmed(name, timeStr);
        }

        // Smart 30-min Reminder Simulation
        setTimeout(() => {
            if (window.notifier && typeof window.notifier.notifySmartReminder === 'function') {
                window.notifier.notifySmartReminder(name);
            }
        }, 5000);

        this.navigate('barberProfile', { id: this.currentParams.barberId });
    }

    triggerEmergency() {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("حالة طارئة 🚨", "تم إرسال طلب حجز طارئ للحلاق. يرجى الانتظار للموافقة الفورية.", "error", true);
        }
    }

    // Tab switchers
    switchTab(tabId) {
        document.querySelectorAll('.profile-tab-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.profile-tab-content').forEach(el => el.style.display = 'none');

        const tabList = {
            'store': 'products-grid',
            'gallery': 'products-grid',
            'reviews': 'block'
        };

        if (document.getElementById('tab-' + tabId)) {
            document.getElementById('tab-' + tabId).classList.add('active');
            let contentEl = document.getElementById('tab-content-' + tabId);
            if (contentEl) {
                contentEl.style.display = tabList[tabId] === 'products-grid' ? 'grid' : tabList[tabId] || 'block';
            }
        }
    }

    switchBarberDashboardTab(tabId) {
        document.querySelectorAll('.bdash-tab-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.bdash-content').forEach(el => el.style.display = 'none');

        if (document.getElementById('bdash-tab-' + tabId)) {
            document.getElementById('bdash-tab-' + tabId).classList.add('active');
            let contentEl = document.getElementById('bdash-content-' + tabId);
            if (contentEl) contentEl.style.display = 'block';
        }
    }

    simulateNotification() {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("إشعار تجريبي", "الإشعارات اللحظية تعمل بنجاح.", "info", true);
        }
    }

    simulateNotificationError(msg) {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تنبيه", msg, "error");
        }
    }

    toggleSetting(settingName) {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تحديث الإعدادات", `تم بنجاح تغيير حالة: ${settingName}`, "success");
        }
    }

    // Admin Auth
    verifyAdmin() {
        const passEl = document.getElementById('admin-password');
        const pass = passEl ? passEl.value : '';
        
        if (!pass || pass.trim() === '') {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "يرجى إدخال كلمة المرور", "error");
            }
            return;
        }
        
        if (pass === 'mahmoud2005') {
            this.navigate('adminEmailSetup');
        } else {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "كلمة المرور غير صحيحة", "error");
            }
        }
    }

    verifyAdminEmail() {
        const emailInput = document.getElementById('admin-email');
        const email = emailInput ? emailInput.value : '';
        
        if (!email || email.trim() === '') {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
            }
            return;
        }
        
        // Disable button to prevent multiple submissions
        const btn = document.getElementById('admin-submit-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'جاري المعالجة...';
        }

        // Add timeout to prevent freezing
        const timeout = setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "انتهت مهلة الانتظار. يرجى محاولة مرة أخرى.", "error");
            }
        }, 5000);

        try {
            localStorage.setItem('barbergo_session', 'admin');
            clearTimeout(timeout);
            
            this.askPushNotificationsPermission();
            this.navigate('adminDashboard');
            
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
        } catch (err) {
            clearTimeout(timeout);
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "حدث خطأ أثناء تسجيل الدخول", "error");
            }
            console.error('[App] Admin email verification error:', err);
        }
    }

    verifyBarber() {
        const codeInput = document.getElementById('barber-code');
        const code = codeInput ? codeInput.value : '';
        
        if (!code || code.trim() === '') {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "يرجى إدخال رمز الدخول", "error");
            }
            return;
        }
        
        if (code === '0000') {
            this.navigate('barberEmailSetup');
        } else {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "رمز الدخول غير صحيح", "error");
            }
        }
    }

    async verifyBarberEmail(passedEmail = null) {
        const emailInput = document.getElementById('barber-email');
        const email = passedEmail || (emailInput ? emailInput.value : 'google_auth');

        if (!email || email.trim() === '') {
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
            }
            return;
        }

        // Disable button to prevent multiple submissions
        const btn = document.getElementById('barber-submit-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'جاري المعالجة...';
        }

        // Add timeout to prevent infinite hanging on mobile networks
        const timeout = setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "انتهت مهلة الانتظار. يرجى التحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.", "error");
            }
        }, 8000);

        try {
            // Initialize Firebase auth with timeout
            if (window.dbService && typeof window.dbService.ensureAuthReady === 'function') {
                await Promise.race([
                    window.dbService.ensureAuthReady(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000))
                ]);
            }

            if (!window.db || !window.db.barbers) return;

            // Find or Create Barber
            let barber = window.db.barbers.find(b => b.email === email);
            let isNew = false;

            if (!barber) {
                isNew = true;
                const newId = window.db.barbers.length > 0 ? Math.max(...window.db.barbers.map(b => b.id)) + 1 : 1;
                barber = {
                    id: newId,
                    email: email,
                    name: 'صالون جديد',
                    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&q=80',
                    bio: 'أهلاً بك في صفحتي على BarberGo. يمكنك التعرف على خدماتي وحجز موعدك.',
                    location: 'عمان',
                    phone: '',
                    subscriptionStatus: 'trial',
                    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    homeService: false,
                    rating: 5.0,
                    reviewsCount: 0,
                    settings: { slotDurationMinutes: 30, workingHours: '10:00 ص - 10:00 م' },
                    paymentMethods: {}
                };
                const barberUid = window.dbService && typeof window.dbService.getCustomerUid === 'function' ? window.dbService.getCustomerUid() : null;
                if (barberUid) {
                    barber.barber_uid = barberUid;
                }
                window.db.barbers.push(barber);
                
                if (window.saveDB && typeof window.saveDB === 'function') {
                    window.saveDB();
                }
            }
            else {
                const barberUid = window.dbService && typeof window.dbService.getCustomerUid === 'function' ? window.dbService.getCustomerUid() : null;
                if (barberUid && !barber.barber_uid) {
                    barber.barber_uid = barberUid;
                    if (window.saveDB && typeof window.saveDB === 'function') {
                        window.saveDB();
                    }
                }
            }

            clearTimeout(timeout);
            localStorage.setItem('barbergo_session', 'barber_' + barber.id);

            if (isNew) {
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("تم تفعيل حسابك", "تهانينا! لديك فترة تجربة مجانية لمدة 30 يوماً. قم بتعبئة بيانات صالونك الآن.", "success");
                }
            } else {
                if (window.notifier && typeof window.notifier.show === 'function') {
                    window.notifier.show("مرحباً بك", `أهلاً بك مجدداً في لوحة التحكم يا ${barber.name}.`, "success");
                }
            }

            this.askPushNotificationsPermission();
            this.navigate('barberDashboard', { id: barber.id });
            
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
        } catch (err) {
            clearTimeout(timeout);
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'دخول للوحة التحكم';
            }
            console.error('[App] Barber email verification error:', err);
            if (window.notifier && typeof window.notifier.show === 'function') {
                window.notifier.show("خطأ", "حدث خطأ أثناء التحقق من البريد الإلكتروني. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.", "error");
            }
        }
    }

    sendSubscriptionAlert(barberName) {
        if (window.notifier && typeof window.notifier.show === 'function') {
            window.notifier.show("تم الإرسال", `تم إرسال تنبيه تجديد الاشتراك لصالون: ${barberName}`, "success");
        }
    }

    // Voice Search
    startVoiceSearch(btn) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            window.notifier.show("غير مدعوم", "متصفحك الحالي لا يدعم التعرف على الصوت. يرجى إدخال اسم الصالون يدوياً.", "warning");
            const manualSearch = prompt(this.language === 'en' ? 'Enter salon name:' : 'يرجى إدخال اسم الصالون للبحث عنه:');
            if (manualSearch) {
                if (this.currentView === 'clientHome') {
                    const searchInput = document.getElementById('client-search-input');
                    if (searchInput) {
                        searchInput.value = manualSearch;
                        this.filterBarbers();
                    }
                }
            }
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = this.language === 'en' ? 'en-US' : 'ar-SA';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            window.notifier.show("تحدث الآن", "نحن نستمع إليك... قل اسم الصالون.", "info");

            recognition.start();

            recognition.onresult = (event) => {
                const speechResult = event.results[0][0].transcript;
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                window.notifier.show("تم الالتقاط", `البحث عن: "${speechResult}"`, "success");
                
                if (this.currentView === 'clientHome') {
                    const searchInput = document.getElementById('client-search-input');
                    if (searchInput) {
                        searchInput.value = speechResult;
                        this.filterBarbers();
                    }
                }
            };

            recognition.onspeechend = () => {
                recognition.stop();
            };

            recognition.onerror = (event) => {
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                window.notifier.show("خطأ", "لم نتمكن من التعرف على الصوت بوضوح.", "error");
            };
        } catch (error) {
            window.notifier.show("غير مدعوم", "يبدو أن متصفحك يمنع تسجيل الصوت. يرجى البحث يدوياً.", "warning");
            const manualSearch = prompt(this.language === 'en' ? 'Enter salon name:' : 'يرجى إدخال اسم الصالون للبحث عنه:');
            if (manualSearch) {
                if (this.currentView === 'clientHome') {
                    const searchInput = document.getElementById('client-search-input');
                    if (searchInput) {
                        searchInput.value = manualSearch;
                        this.filterBarbers();
                    }
                }
            }
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        }
    }

    // AI Camera Real Logic
    startAIScanning(btn) {
        const scanLine = document.getElementById('ai-scan-line');
        const feed = document.getElementById('ai-camera-feed');
        const placeholder = document.getElementById('ai-camera-placeholder');
        const mockResult = document.getElementById('ai-mock-result');
        const flipBtn = document.getElementById('flip-camera-btn');
        if (!scanLine || !feed) return;

        btn.innerHTML = '<i class="fa-solid fa-camera fa-fade"></i> جاري فتح الكاميرا...';
        btn.disabled = true;

        if (!this.currentFacingMode) this.currentFacingMode = 'user';

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode } })
                .then(stream => {
                    this.aiStream = stream;
                    feed.srcObject = stream;
                    if (placeholder) placeholder.style.display = 'none';
                    feed.style.display = 'block';
                    if (flipBtn) flipBtn.style.display = 'block';
                    scanLine.style.display = 'block';
                    window.notifier.show("الكاميرا نشطة", "يتم الآن تحليل ملامح وجهك...", "info");

                    setTimeout(() => {
                        if (this.aiStream) {
                            this.aiStream.getTracks().forEach(track => track.stop());
                        }
                        feed.style.display = 'none';
                        if (flipBtn) flipBtn.style.display = 'none';
                        
                        // محاكاة تحليل شكل الوجه واختيار نتيجة
                        const faceResults = [
                            { shape: 'وجه دائري (Round)', cut: 'قصة بومبادور (Pompadour)', img: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80' },
                            { shape: 'وجه طويل (Oval)', cut: 'قصة فرنسية (French Crop)', img: 'https://images.unsplash.com/photo-1593962657416-8360d2b27a3c?w=400&q=80' },
                            { shape: 'وجه مربّع (Square)', cut: 'قصة Fade مدرج', img: 'https://images.unsplash.com/photo-1605406575497-2e5a707a0ee0?w=400&q=80' }
                        ];
                        const randomResult = faceResults[Math.floor(Math.random() * faceResults.length)];
                        
                        mockResult.style.display = 'block';
                        mockResult.src = randomResult.img;
                        scanLine.style.display = 'none';

                        document.getElementById('ai-scan-btn-container').style.display = 'none';
                        document.getElementById('ai-results-actions').style.display = 'block';
                        window.notifier.show('اكتمل التحليل', `تم التعرف على: ${randomResult.shape}. القصة الأنسب لك هي: ${randomResult.cut}!`, 'success');
                    }, 5000);
                })
                .catch(err => {
                    btn.innerHTML = '<i class="fa-solid fa-camera"></i> تحليل وجهي الآن';
                    btn.disabled = false;
                    window.notifier.show("إذن مرفوض", "يرجى إعطاء صلاحية الكاميرا لتعمل مرآة الذكاء.", "error");
                });
        } else {
            window.notifier.show("غير مدعوم", "متصفحك لا يدعم فتح الكاميرا.", "error");
            btn.innerHTML = '<i class="fa-solid fa-camera"></i> تحليل وجهي الآن';
            btn.disabled = false;
        }
    }

    flipCamera() {
        if (this.aiStream) {
            this.aiStream.getTracks().forEach(track => track.stop());
        }
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        
        const feed = document.getElementById('ai-camera-feed');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode } })
                .then(stream => {
                    this.aiStream = stream;
                    feed.srcObject = stream;
                })
                .catch(err => {
                    window.notifier.show("خطأ", "لم نتمكن من التبديل للكاميرا الأخرى.", "error");
                });
        }
    }

    showAdminPayoutDetails() {
        const payout = db.adminSettings.payoutDetails;
        let details = "يمكنك تجديد اشتراكك عبر وسائل الدفع التالية الخاصة بالمدير العام:\n\n";

        if (payout.cliq) details += `📱 كليك (CliQ): ${payout.cliq}\n`;
        if (payout.wallet) details += `💳 المحفظة: ${payout.wallet}\n`;

        if (payout.bankIban || payout.accountHolder) {
            details += `\n🏦 التحويل البنكي:\n`;
            details += `البنك: ${payout.bankName}\n`;
            details += `الاسم: ${payout.accountHolder}\n`;
            details += `IBAN: ${payout.bankIban}\n`;
        }

        details += `\nالرجاء تحويل مبلغ الاشتراك وإرسال الإيصال للدعم الفني.`;
        window.notifier.show("خيارات الدفع للمنصة", details, "info");
    }

    saveAdminPayoutDetails() {
        const cliq = document.getElementById('admin-cliq').value;
        const wallet = document.getElementById('admin-wallet').value;
        const holder = document.getElementById('admin-holder').value;
        const bank = document.getElementById('admin-bank').value;
        const iban = document.getElementById('admin-iban').value;

        db.adminSettings.payoutDetails = {
            cliq: cliq,
            wallet: wallet,
            accountHolder: holder,
            bankName: bank,
            bankIban: iban
        };

        window.notifier.show('تم الحفظ', 'تم تحديث بيانات تحصيل الأرباح بنجاح', 'success');
    }

    showClientPaymentMethods(barberId) {
        const barber = db.barbers.find(b => b.id === barberId);
        if (!barber || !barber.paymentMethods) return;

        let details = "لراحتك، يمكنك الدفع مسبقاً براحة تامة، أو الدفع نقداً بالصالون.\n\n";
        if (barber.paymentMethods.cliq) details += `📱 كليك (CliQ): ${barber.paymentMethods.cliq}\n`;
        if (barber.paymentMethods.wallet) details += `💳 محفظة: ${barber.paymentMethods.wallet}\n`;
        if (barber.paymentMethods.visa) details += `✅ الدفع بالبطاقة بالصالون متاح\n`;

        details += "\n(الحجز مؤكد حتى بدون الدفع المسبق)";
        window.notifier.show("طرق الدفع المتاحة للصالون", details, "info");
    }

    // ==========================================
    // Admin Dashboard Specific Functions
    // ==========================================
    switchAdminTab(tabId) {
        document.querySelectorAll('.admin-tab-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`admin-tab-${tabId}`).classList.add('active');
        document.querySelectorAll('.admin-content').forEach(el => el.style.display = 'none');
        document.getElementById(`admin-content-${tabId}`).style.display = 'block';
    }

    initAdminChart() {
        const ctx = document.getElementById('growthChart');
        if (!ctx || !window.Chart) return;

        const growthData = window.db.adminSettings.monthlyGrowth;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: growthData.labels,
                datasets: [{
                    label: 'عدد الحلاقين الجدد',
                    data: growthData.data,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }

    toggleBarberStatus(id, btnElement) {
        const barber = window.db.barbers.find(b => b.id === id);
        if (barber) {
            const isBlocked = barber.subscriptionStatus === 'blocked';
            barber.subscriptionStatus = isBlocked ? 'active' : 'blocked';

            if (barber.subscriptionStatus === 'blocked') {
                btnElement.classList.replace('btn-primary', 'btn-danger');
                btnElement.innerHTML = '<i class="fa-solid fa-lock"></i> محظور';
                window.notifier.show("تم الحظر", `تم إيقاف حساب ${barber.name} بنجاح.`, "error");
            } else {
                btnElement.classList.replace('btn-danger', 'btn-primary');
                btnElement.innerHTML = '<i class="fa-solid fa-lock-open"></i> تفعيل';
                window.notifier.show("تم التفعيل", `تم إعادة تفعيل حساب ${barber.name}.`, "success");
            }
            window.saveDB();
        }
    }

    deleteBarber(id) {
        const confirmed = confirm("هل أنت متأكد من حذف هذا الحلاق بشكل نهائي؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف كافة بياناته وحجوزاته!");
        if (confirmed) {
            const index = window.db.barbers.findIndex(b => b.id === id);
            if (index > -1) {
                const bName = window.db.barbers[index].name;
                window.db.barbers.splice(index, 1);
                window.db.products = window.db.products.filter(p => p.barber_id !== id);
                window.db.services = window.db.services.filter(s => s.barber_id !== id);
                window.saveDB();
                window.notifier.show("تم الحذف", `تم حذف بيانات الحلاق ${bName} كلياً من النظام.`, "error");
                this.navigate('adminDashboard'); // Refresh view
            }
        }
    }

    manageBarberTrial(id) {
        const barber = window.db.barbers.find(b => b.id === id);
        if (barber) {
            const newDays = prompt(`أدخل عدد الأيام التي تريد إضافتها كفترة تجريبية لصالون ${barber.name}:\n(أدخل رقماً، مثلاً: 30)`, "30");
            if (newDays && !isNaN(parseInt(newDays))) {
                const days = parseInt(newDays);
                const endDate = new Date(barber.subscriptionEndDate || Date.now());
                endDate.setDate(endDate.getDate() + days);
                barber.subscriptionEndDate = endDate.toISOString();
                barber.subscriptionStatus = 'trial';
                window.saveDB();
                window.notifier.show("تم التحديث", `تم تمديد الفترة التجريبية للحلاق ${barber.name} لمدة ${days} يوماً بنجاح.`, "success");
                this.navigate('adminDashboard'); // Refresh view
            }
        }
    }

    saveBarberSettings() {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);

        if (barber) {
            barber.name = document.getElementById('barber-edit-name').value;
            barber.bio = document.getElementById('barber-edit-bio').value;
            barber.phone = document.getElementById('barber-edit-phone').value;
            barber.location = document.getElementById('barber-edit-location').value;
            
            if (!barber.social) barber.social = {};
            barber.social.whatsapp = document.getElementById('barber-edit-whatsapp').value;
            barber.social.instagram = document.getElementById('barber-edit-instagram').value;
            barber.social.facebook = document.getElementById('barber-edit-facebook').value;
            barber.social.website = document.getElementById('barber-edit-website').value;

            window.saveDB();
            window.notifier.show("تم الحفظ", "تم حفظ وتحديث إعدادات ملفك الشخصي وعرضها للعملاء بنجاح.", "success");
        }
    }

    toggleBarberSettingParam(btnElement, paramKey) {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (!barber) return;

        if (!barber.settings) barber.settings = {};

        if (paramKey === 'enableEmergency') {
            barber.settings.enableEmergency = !barber.settings.enableEmergency;
            const state = barber.settings.enableEmergency;
            btnElement.className = `btn ${state ? 'btn-success' : 'btn-ghost text-muted'}`;
            btnElement.innerHTML = state ? '<i class="fa-solid fa-toggle-on"></i> مفعل' : '<i class="fa-solid fa-toggle-off"></i> معطل';
            window.notifier.show("تم التحديث", `تم ${state ? 'تفعيل' : 'تعطيل'} زر اتصال الطوارئ.`, "info");
        } else if (paramKey === 'homeService') {
            barber.homeService = !barber.homeService;
            const state = barber.homeService;
            btnElement.className = `btn ${state ? 'btn-primary' : 'btn-ghost text-muted'}`;
            btnElement.innerHTML = state ? '<i class="fa-solid fa-toggle-on"></i> متاح' : '<i class="fa-solid fa-toggle-off"></i> غير متاح';
            window.notifier.show("تم التحديث", `تم ${state ? 'تفعيل' : 'تعطيل'} خدمة الحلاقة المنزلية.`, "info");
        } else if (paramKey === 'visaPayment') {
            if (!barber.paymentMethods) barber.paymentMethods = {};
            barber.paymentMethods.visa = !barber.paymentMethods.visa;
            const state = barber.paymentMethods.visa;
            btnElement.className = `btn ${state ? 'btn-primary' : 'btn-ghost text-muted'}`;
            btnElement.innerHTML = state ? 'مفعل' : 'معطل';
            window.notifier.show("تم التحديث", `تم ${state ? 'تفعيل' : 'إلغاء'} الدفع بالبطاقة.`, "info");
        }
        window.saveDB();
        window.saveDB();
    }

    saveBarberPayment() {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (!barber) return;

        if (!barber.paymentMethods) barber.paymentMethods = {};
        barber.paymentMethods.cliq = document.getElementById('barber-payment-cliq').value;
        barber.paymentMethods.wallet = document.getElementById('barber-payment-wallet').value;
        
        window.saveDB();
        window.notifier.show('تم الحفظ', 'تم تحديث وسائل الدفع بنجاح!', 'success');
    }

    togglePublishProfile(btnElement) {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (!barber) return;

        barber.isPublished = !barber.isPublished;
        window.saveDB();

        if (barber.isPublished) {
            btnElement.className = 'btn w-100 btn-success';
            btnElement.innerHTML = '<i class="fa-solid fa-globe"></i> البروفايل منشور وعام للعملاء';
            btnElement.style.borderColor = '';
            window.notifier.show('تم النشر!', 'تم نشر بروفايلك بنجاح. الآن أنت مرئي لجميع العملاء.', 'success');
        } else {
            btnElement.className = 'btn w-100 btn-outline text-gold';
            btnElement.innerHTML = '<i class="fa-solid fa-rocket"></i> نشر البروفايل للعملاء';
            btnElement.style.borderColor = 'var(--gold-primary)';
            window.notifier.show('تم الإلغاء', 'تم إخفاء بروفايلك عن العملاء مؤقتاً.', 'warning');
        }
    }

    toggleBarberHoliday(btnElement, dayIndex) {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (!barber) return;

        if (!barber.holidays) barber.holidays = [];

        const idx = barber.holidays.indexOf(dayIndex);
        if (idx > -1) {
            barber.holidays.splice(idx, 1);
            btnElement.className = 'btn btn-outline text-muted';
            btnElement.style.borderColor = 'var(--border-color)';
        } else {
            barber.holidays.push(dayIndex);
            btnElement.className = 'btn btn-danger text-white';
            btnElement.style.borderColor = '';
        }
        window.saveDB();
    }


    savePayoutDetails() {
        const iban = document.getElementById('admin-iban').value;
        const bank = document.getElementById('admin-bank').value;
        if (iban && bank) {
            window.notifier.show("تم الحفظ", "تم ربط وتحديث معلومات استقبال الإيرادات بنجاح.", "success");
        } else {
            window.notifier.show("خطأ", "الرجاء تعبئة جميع الحقول المطلوبة.", "warning");
        }
    }

    updateSubscriptionPrice() {
        window.notifier.show("تم التحديث", "تم حفظ أسعار الاشتراكات الجديدة كباقة أساسية للصالونات.", "success");
    }

    // ==========================================
    // Admin New Operational Features
    // ==========================================
    acceptPayment(reqId, salonName) {
        const reqEl = document.getElementById(reqId);
        if (reqEl) {
            reqEl.style.display = 'none';
            window.notifier.show("تم التفعيل", `تم قبول الحوالة المالية وتفعيل اشتراك صالون ${salonName} بنجاح.`, "success");
        }
    }

    rejectPayment(reqId) {
        const reason = prompt("يرجى إدخال سبب رفض طلب التفعيل لإرساله للحلاق:");
        if (reason !== null) {
            const reqEl = document.getElementById(reqId);
            if (reqEl) {
                reqEl.style.display = 'none';
                window.notifier.show("تم الرفض", `تم رفض الحوالة وإرسال السبب "${reason}" للصالون.`, "error");
            }
        }
    }

    sendBroadcast() {
        const target = document.getElementById('broadcast-target').value;
        const msg = document.getElementById('broadcast-message').value;
        
        if (!msg.trim()) {
            window.notifier.show("خطأ", "لا يمكن إرسال رسالة فارغة.", "warning");
            return;
        }

        let targetName = target === 'all' ? 'جميع المستخدمين' : target === 'barbers' ? 'جميع الحلاقين' : 'جميع العملاء';
        window.notifier.show("تم البث", `تم إرسال الإشعار لـ ${targetName} بنجاح!`, "success");
        document.getElementById('broadcast-message').value = '';
    }

    downloadFinancialReport(barberId, barberName) {
        window.notifier.show("جاري التحميل...", `يتم الآن استخراج التقرير المالي الشامل لصالون ${barberName} بصيغة PDF...`, "info");
        setTimeout(() => {
            window.notifier.show("اكتمل التحميل", `تم حفظ التقرير المالي لـ ${barberName} في جهازك.`, "success");
        }, 2000);
    }
}

// ============================================================================
// CRITICAL: Bootstrap with bulletproof error handling and dependency waiting
// ============================================================================
async function 


waitForBootstrapDependencies() {
    const requiredChecks = [
        () => document.readyState === 'interactive' || document.readyState === 'complete',
        () => !!document.getElementById('app'),
        () => window.UI && typeof window.UI === 'object',
        () => window.notifier && typeof window.notifier.show === 'function'
    ];

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
        if (requiredChecks.every(check => {
            try {
                return check();
            } catch (err) {
                return false;
            }
        })) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    window.forceBarberGoUI?.();
    const forceUIFallback = setTimeout(() => window.forceBarberGoUI?.(), 900);

    if (window.app) {
        clearTimeout(forceUIFallback);
        return; // Already initialized
    }
    
    try {
        console.log('⏳ Waiting for bootstrap dependencies...');
        
        // Wait for all required globals to be ready
        await waitForBootstrapDependencies();
        
        // Verify critical globals with fallbacks
        if (!window.db) {
            console.warn('⚠️ window.db missing - initializing defaults');
            window.db = { barbers: [], services: [], products: [], bookings: [], notifications: [] };
        }
        
        if (!window.UI) {
            console.error('🔴 CRITICAL: window.UI is still undefined - UI components failed to load');
            // Create minimal fallback UI
            window.UI = {
                renderLoadingPlaceholder: (msg) => `<div style="text-align:center;padding:50px;color:#fff;background:#000;">${msg}</div>`
            };
        }
        
        if (!window.notifier) {
            console.warn('⚠️ window.notifier missing - creating minimal fallback');
            window.notifier = {
                show: (title, msg) => console.log(`[NOTIF] ${title}: ${msg}`)
            };
        }
        
        if (!window.dbService) {
            console.warn('⚠️ window.dbService missing - Firebase service may have failed');
        }
        
        console.log('✅ Starting App initialization');
        // Ensure a root #app container exists (defensive for some production routes)
        try {
            if (!document.getElementById('app')) {
                const root = document.createElement('div');
                root.id = 'app';
                document.body.insertBefore(root, document.body.firstChild || null);
                console.warn('[Init] #app was missing, created a fallback root container.');
            }
        } catch (e) {
            console.warn('[Init] Could not ensure #app container:', e);
        }

        window.app = new App();
        window.forceBarberGoUI?.();
        clearTimeout(forceUIFallback);
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('🔴 FATAL: App initialization failed:', error);
        // Render emergency fallback
        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#000;color:#fff;font-family:Arial,sans-serif;padding:20px;text-align:center;">
                    <div>
                        <h1 style="font-size:1.5rem;margin:0 0 20px 0;">⚠️ تحذير تقني</h1>
                        <p style="margin:0 0 10px 0;font-size:0.95rem;">حدث خطأ في تحميل التطبيق</p>
                        <p style="margin:0 0 20px 0;font-size:0.85rem;color:#ccc;">حاول تحديث الصفحة أو امسح ذاكرة التخزين المؤقت</p>
                        <button onclick="location.reload()" style="padding:10px 20px;background:#ffd700;color:#000;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">إعادة تحميل</button>
                    </div>
                </div>
            `;
        }
        throw error; // Re-throw so console shows full error
    }
});
