// Login Form Component - Extracted for better performance and maintainability
// This file contains all login and authentication form renderers

const LoginFormComponent = {
    /**
     * Renders the barber login form
     * @returns {string} HTML string for barber login
     */
    renderBarberLogin() {
        return `
            ${window.HeaderComponent ? window.HeaderComponent.renderTopHeader('بوابة الحلاقين') : ''}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4"><i class="fa-solid fa-store"></i></div>
                    <h2 class="text-gold mb-4">الدخول لصالونك</h2>
                    <div class="form-group">
                        <input type="password" id="barber-code" class="form-control text-center" style="-webkit-text-security: disc;" placeholder="رمز الدخول" maxlength="10">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyBarber()">متابعة</button>
                </div>
                <button class="btn btn-ghost w-100" onclick="app.navigate('welcome')">العودة للرئيسية</button>
            </div>
        `;
    },

    /**
     * Renders the barber email setup form
     * @returns {string} HTML string for barber email setup
     */
    renderBarberEmailSetup() {
        return `
            ${window.HeaderComponent ? window.HeaderComponent.renderTopHeader('بوابة الحلاقين') : ''}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4" style="border-color: #e74c3c; color: #e74c3c;"><i class="fa-brands fa-google"></i></div>
                    <h2 class="text-gold mb-3">ربط البريد الإلكتروني</h2>
                    <p class="text-muted mb-4" style="font-size: 0.85rem;">لأغراض الأمان والحجوزات، يرجى إدخال حساب الـ Gmail الخاص بك للمتابعة</p>
                    <div class="form-group mb-4">
                        <input type="email" id="barber-email" class="form-control text-left" dir="ltr" placeholder="example@gmail.com">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyBarberEmail()" id="barber-submit-btn">دخول للوحة التحكم</button>
                    <div class="text-muted mb-3" style="font-size: 0.8rem;">أو الدخول مباشرة بـ:</div>
                    <button class="btn btn-ghost btn-block" style="border: 1px solid #333;" onclick="app.verifyBarberEmail()">
                        <i class="fa-brands fa-google text-danger"></i> Google Login
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Renders the admin login form
     * @returns {string} HTML string for admin login
     */
    renderAdminLogin() {
        return `
            ${window.HeaderComponent ? window.HeaderComponent.renderTopHeader('لوحة المدير') : ''}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4"><i class="fa-solid fa-shield-halved"></i></div>
                    <h2 class="text-gold mb-4">بوابة الإدارة</h2>
                    <div class="form-group">
                        <input type="password" id="admin-password" class="form-control text-center" style="-webkit-text-security: disc;" placeholder="كلمة المرور" maxlength="20">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyAdmin()">متابعة</button>
                </div>
                <button class="btn btn-ghost w-100" onclick="app.navigate('welcome')">العودة للرئيسية</button>
            </div>
        `;
    },

    /**
     * Renders the admin email setup form
     * @returns {string} HTML string for admin email setup
     */
    renderAdminEmailSetup() {
        return `
            ${window.HeaderComponent ? window.HeaderComponent.renderTopHeader('لوحة المدير') : ''}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4" style="border-color: #e74c3c; color: #e74c3c;"><i class="fa-brands fa-google"></i></div>
                    <h2 class="text-gold mb-3">ربط البريد الإلكتروني للمدير</h2>
                    <p class="text-muted mb-4" style="font-size: 0.85rem;">يرجى تأكيد حساب الـ Gmail الخاص بك كبوابة تسجيل آمنة</p>
                    <div class="form-group mb-4">
                        <input type="email" id="admin-email" class="form-control text-left" dir="ltr" placeholder="admin@gmail.com">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyAdminEmail()" id="admin-submit-btn">دخول للوحة التحكم</button>
                    <div class="text-muted mb-3" style="font-size: 0.8rem;">أو الدخول مباشرة بـ:</div>
                    <button class="btn btn-ghost btn-block" style="border: 1px solid #333;" onclick="app.verifyAdminEmail()">
                        <i class="fa-brands fa-google text-danger"></i> Google Login
                    </button>
                </div>
            </div>
        `;
    }
};

// Export for use in other modules
window.LoginFormComponent = LoginFormComponent;
