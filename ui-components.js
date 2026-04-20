// ==========================================
// UI Components for BarberGo (Custom Version)
// ==========================================

const UI = {
    // 1. الهيدر (رأس الصفحة)
    renderTopHeader(title = 'BarberGo') {
        return `
            <header class="top-header" style="background: var(--bg-card); padding: 15px; border-bottom: 1px solid var(--gold-primary); position: sticky; top: 0; z-index: 1000;">
                <div class="container d-flex justify-content-between align-items-center">
                    <div class="header-actions">
                        <button class="btn btn-ghost" onclick="app.navigate('welcome')" style="color: var(--gold-primary);"><i class="fa-solid fa-gear"></i></button>
                    </div>
                    <div class="navbar-brand">
                        <span class="text-gold" style="font-size: 1.4rem; font-weight: 800;">${title}</span>
                    </div>
                    <div style="width: 40px; height: 40px; background: var(--gold-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-scissors" style="color: #000;"></i>
                    </div>
                </div>
            </header>
        `;
    },

    // 2. الصفحة الرئيسية (Welcome)
    renderWelcome() {
        return `
            <div class="welcome-container text-center" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;">
                <i class="fa-solid fa-crown mb-4" style="font-size: 4rem; color: var(--gold-primary);"></i>
                <h1 class="text-gold mb-5" style="font-size: 2.5rem; font-weight: 900;">BarberGo</h1>
                
                <div class="pill-box w-100 mb-3 cursor-pointer" onclick="app.navigate('clientHome')" style="border: 2px solid var(--gold-primary); padding: 20px; border-radius: 15px;">
                    <h3 class="text-white m-0">دخول كـ عميل</h3>
                </div>
                
                <div class="pill-box w-100 mb-4 cursor-pointer" onclick="app.navigate('barberLogin')" style="border: 1px solid #444; padding: 20px; border-radius: 15px; background: rgba(255,255,255,0.05);">
                    <h3 class="text-white m-0">دخول كـ حلاق</h3>
                </div>

                <div class="text-muted mt-4 cursor-pointer" onclick="app.navigate('adminLogin')" style="text-decoration: underline;">دخول الإدارة العامة</div>
            </div>
        `;
    },

    // 3. لوحة تحكم الحلاق (المفرغة 100%)
    renderBarberDashboard(barberId) {
        // نستخدم بيانات مفرغة إذا لم تتوفر بيانات
        const barber = (window.db && db.barbers.find(b => b.id === barberId)) || {
            name: "صالون جديد",
            phone: "",
            bio: "أهلاً بك في صالوني.. جاري تجهيز الملف",
            stats: { revenue: 0, appointments: 0 }
        };

        return `
            ${this.renderTopHeader('لوحة تحكم الحلاق')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                
                <!-- إحصائيات سريعة -->
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="pill-box text-center p-3" style="border: 1px solid var(--gold-primary);">
                            <small class="text-muted d-block mb-1">أرباح اليوم</small>
                            <h4 class="text-white m-0">0 JOD</h4>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="pill-box text-center p-3" style="border: 1px solid var(--gold-primary);">
                            <small class="text-muted d-block mb-1">حجوزات</small>
                            <h4 class="text-white m-0">0</h4>
                        </div>
                    </div>
                </div>

                <!-- تبويبات العمل -->
                <div class="tabs-container d-flex gap-2 mb-4" style="overflow-x: auto; white-space: nowrap; padding-bottom: 10px;">
                    <button class="btn btn-primary btn-sm" onclick="app.switchTab('b-profile')">ملف الصالون</button>
                    <button class="btn btn-outline-gold btn-sm" onclick="app.switchTab('b-services')">الخدمات</button>
                    <button class="btn btn-outline-gold btn-sm" onclick="app.switchTab('b-store')">المتجر</button>
                </div>

                <!-- قسم تعديل الملف (مفرغ) -->
                <div id="tab-content-b-profile" class="tab-content">
                    <div class="pill-box p-3 text-right">
                        <h4 class="text-gold mb-4">إعدادات ملفك الشخصي</h4>
                        <div class="form-group mb-3">
                            <label class="d-block mb-2 text-white">اسم الصالون (تجاري)</label>
                            <input type="text" class="form-control" placeholder="أدخل اسم صالونك" style="background: #111; border: 1px solid #333; color: #fff; padding: 12px;">
                        </div>
                        <div class="form-group mb-3">
                            <label class="d-block mb-2 text-white">الوصف/Bio</label>
                            <textarea class="form-control" rows="3" placeholder="تحدث عن خبرتك..." style="background: #111; border: 1px solid #333; color: #fff; padding: 12px;"></textarea>
                        </div>
                        <div class="form-group mb-4">
                            <label class="d-block mb-2 text-white">رقم الواتساب</label>
                            <input type="text" class="form-control text-left" placeholder="07XXXXXXXX" style="background: #111; border: 1px solid #333; color: #fff; padding: 12px;">
                        </div>
                        <button class="btn btn-primary w-100" onclick="alert('تم حفظ البيانات بنجاح!')">حفظ بروفايل الصالون</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 4. لوحة تحكم المدير (الخاصة بمحمود)
    renderAdminDashboard() {
        const stats = (window.db && db.adminSettings) || { platformRevenue: 0 };
        return `
            ${this.renderTopHeader('إدارة BarberGo')}
            <div class="page container py-4 text-right">
                
                <div class="pill-box mb-4 text-center" style="background: var(--gold-gradient); padding: 30px; border-radius: 20px;">
                    <h5 style="color: #000; font-weight: bold;">إجمالي أرباح المنصة</h5>
                    <h2 style="color: #000; font-weight: 900; font-size: 2.5rem;">${stats.platformRevenue} JOD</h2>
                </div>

                <div class="pill-box p-3 mb-4 border-gold">
                    <h4 class="text-gold mb-4"><i class="fa-solid fa-money-bill-transfer"></i> إعدادات تحصيل أموالي</h4>
                    <p class="text-muted small">هذه البيانات تظهر للحلاقين عند دفع قيمة الاشتراك السنوي/الشهري.</p>
                    
                    <div class="form-group mb-3">
                        <label class="text-white mb-2 d-block">حساب CliQ (الاسم المستعار)</label>
                        <input type="text" id="admin-cliq" class="form-control text-center" style="background: #111; color: var(--gold-primary); font-weight: bold;" value="MAHMOUD_GO">
                    </div>
                    
                    <div class="form-group mb-4">
                        <label class="text-white mb-2 d-block">رقم محفظة ZainCash / Orange</label>
                        <input type="text" id="admin-wallet" class="form-control text-center" style="background: #111; color: var(--gold-primary); font-weight: bold;" value="07XXXXXXXX">
                    </div>
                    
                    <button class="btn btn-primary w-100" onclick="alert('تم تحديث بياناتك بنجاح!')">تحديث بيانات التحصيل</button>
                </div>

                <h4 class="text-white mb-3">الصالونات المشتركة</h4>
                <div id="admin-barbers-list">
                    <p class="text-muted text-center">لا يوجد صالونات نشطة حالياً</p>
                </div>
            </div>
        `;
    }
};

// ربط الواجهة بالكائن العالمي
window.UI = UI;
