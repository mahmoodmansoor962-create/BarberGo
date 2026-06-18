// Header Component - Extracted for better performance and maintainability
// This file contains top header and bottom navigation components

const HeaderComponent = {
    /**
     * Renders the top header with branding and action buttons
     * @param {string} title - Title text to display
     * @returns {string} HTML string for the header
     */
    renderTopHeader(title = 'BarberGo') {
        const langText = window.app && window.app.language === 'en' ? 'عربي' : 'English';
        return `
            <header class="top-header" role="banner">
                <div class="container">
                    <div class="header-actions">
                        <button class="lang-btn" onclick="app.toggleLanguage()" aria-label="Toggle Language">
                            <i class="fa-solid fa-globe"></i> ${langText}
                        </button>
                        <button class="bell-btn" onclick="app.openNotifications()" aria-label="Notifications">
                            <i class="fa-regular fa-bell"></i>
                            <span class="bell-dot"></span>
                        </button>
                    </div>
                    <div class="navbar-brand">
                        <span class="text-gold" style="font-size: 1.2rem;">${title}</span>
                    </div>
                    <div>
                        <button class="btn btn-ghost" style="font-size: 0.8rem; padding: 5px 10px; color: var(--gold-primary);" onclick="app.navigate('welcome')">الخيارات</button>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Renders the bottom navigation bar
     * @param {string} activeTab - The currently active tab name
     * @returns {string} HTML string for the bottom navigation
     */
    renderBottomNav(activeTab = 'home') {
        const lang = window.app && window.app.language ? window.app.language : 'ar';
        const i18n = window.i18n ? window.i18n[lang] : { settings: 'الإعدادات', home: 'الرئيسية' };
        
        return `
            <nav class="bottom-nav-container" role="navigation" aria-label="Main navigation">
                <div class="bottom-nav">
                    <div class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="app.navigate('clientSettings')" role="button" tabindex="0" aria-label="Settings">
                        <i class="fa-solid fa-gear"></i>
                        <span>${i18n.settings}</span>
                    </div>
                    <div class="nav-center-action" onclick="app.navigate('aiCamera')" role="button" tabindex="0" aria-label="AI Camera">
                        <i class="fa-solid fa-scissors"></i>
                    </div>
                    <div class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="app.navigate('clientHome')" role="button" tabindex="0" aria-label="Home">
                        <i class="fa-solid fa-house"></i>
                        <span>${i18n.home}</span>
                    </div>
                </div>
            </nav>
        `;
    }
};

// Export for use in other modules
window.HeaderComponent = HeaderComponent;
