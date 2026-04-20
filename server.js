// ==========================================
// BarberGo - نظام الإدارة المتكامل
// ==========================================

// 1. قاعدة البيانات المؤقتة (Data Store)
const db = {
    barbers: [], // سيمتلئ عندما يسجل الحلاقون
    adminSettings: {
        platformRevenue: 0,
        totalAppointments: 0,
        payoutDetails: {
            cliq: "ALIALI123", // ضع حسابك هنا
            wallet: "079XXXXXXX" // ضع رقمك هنا
        }
    }
};

// 2. المحرك الأساسي (The App Engine)
const app = {
    init() {
        this.renderPage('home');
    },

    renderPage(page, data = null) {
        const content = document.getElementById('main-content');
        switch(page) {
            case 'home':
                content.innerHTML = UI.renderHome();
                break;
            case 'barber-dash':
                content.innerHTML = UI.renderBarberDashboard(data);
                break;
            case 'admin-dash':
                content.innerHTML = UI.renderAdminDashboard();
                break;
            default:
                content.innerHTML = UI.renderHome();
        }
    },

    // وظائف لوحة الحلاق
    switchBarberDashboardTab(tabIndex) {
        document.querySelectorAll('.bdash-content').forEach(el => el.style.display = 'none');
        document.getElementById(`bdash-content-${tabIndex}`).style.display = 'block';
        document.querySelectorAll('.bdash-tab-item').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
    },

    saveBarberProfile() {
        alert("تم حفظ بيانات الصالون بنجاح! سيتم مراجعتها من قبل الإدارة.");
    },

    saveAdminPayoutDetails() {
        const cliq = document.getElementById('admin-cliq').value;
        db.adminSettings.payoutDetails.cliq = cliq;
        alert("تم تحديث بيانات التحصيل الخاصة بك كمدير.");
    }
};

// 3. واجهة المستخدم (The UI Master)
const UI = {
    renderTopHeader(title) {
        return `
            <div class="header-nav d-flex justify-content-between align-items-center p-3 mb-4">
                <h3 class="text-gold m-0">${title}</h3>
                <div class="logo-small" style="width: 40px; height: 40px; background: var(--gold-gradient); border-radius: 50%;"></div>
            </div>
        `;
    },

    renderHome() {
        return `
            <div class="text-center py-5">
                <h1 class="text-gold mb-4">BarberGo</h1>
                <p class="text-white mb-4">أهلاً بك في منصة الحلاقة الأولى في الأردن</p>
                <div class="d-grid gap-3 px-4">
                    <button class="btn btn-primary" onclick="app.renderPage('barber-dash', 1)">دخول كحلاق</button>
                    <button class="btn btn-outline-gold" onclick="app.renderPage('admin-dash')">دخول كمدير المنصة</button>
                </div>
            </div>
        `;
    },

    // --- لوحة تحكم الحلاق (مفرغة وجاهزة للإدخال) ---
    renderBarberDashboard(barberId) {
        const barber = db.barbers.find(b => b.id === barberId) || {
            name: "",
            phone: "",
            bio: "",
            stats: { revenue: 0, newClients: 0 }
        };

        return `
            ${this.renderTopHeader('لوحة تحكم الصالون')}
            <div class="page container py-2" style="padding-bottom: 80px;">
                
                <!-- تبويبات التحكم -->
                <div class="tabs-container d-flex gap-2 mb-4" style="overflow-x: auto; padding: 5px;">
                    <button class="btn btn-ghost bdash-tab-item active" onclick="app.switchBarberDashboardTab(1)">الإحصائيات</button>
                    <button class="btn btn-ghost bdash-tab-item" onclick="app.switchBarberDashboardTab(2)">الملف الشخصي</button>
                    <button class="btn btn-ghost bdash-tab-item" onclick="app.switchBarberDashboardTab(3)">الخدمات</button>
                </div>

                <!-- 1. تبويب الإحصائيات -->
                <div id="bdash-content-1" class="bdash-content">
                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <div class="pill-box text-right h-100">
                                <small class="text-muted d-block">أرباحك (JOD)</small>
                                <h3 class="text-white m-0">${barber.stats.revenue}</h3>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="pill-box text-right h-100">
                                <small class="text-muted d-block">زبائن جدد</small>
                                <h3 class="text-gold m-0">${barber.stats.newClients}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="pill-box p-3">
                        <h5 class="text-white mb-3 text-right">نشاط الحجوزات</h5>
                        <div class="d-flex align-items-end justify-content-between" style="height: 100px;">
                            ${this.renderMiniChart()}
                        </div>
                    </div>
                </div>

                <!-- 2. تبويب الملف الشخصي (المكان اللي بيبني فيه الحلاق بروفايله) -->
                <div id="bdash-content-2" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right">
                        <h5 class="text-gold mb-3">تعديل معلومات الصالون</h5>
                        <div class="mb-3">
                            <label class="small text-muted">اسم الصالون</label>
                            <input type="text" id="b-name" class="form-control" placeholder="مثال: صالون المقص الذهبي" value="${barber.name}">
                        </div>
                        <div class="mb-3">
                            <label class="small text-muted">وصف تعريفي</label>
                            <textarea id="b-bio" class="form-control" rows="2" placeholder="أدخل نبذة عن خدماتك...">${barber.bio}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="small text-muted">رقم الهاتف للزبائن</label>
                            <input type="text" id="b-phone" class="form-control text-left" placeholder="07XXXXXXXX" value="${barber.phone}">
                        </div>
                        <button class="btn btn-primary w-100 mt-2" onclick="app.saveBarberProfile()">حفظ التعديلات</button>
                    </div>
                </div>

                <!-- 3. تبويب الخدمات -->
                <div id="bdash-content-3" class="bdash-content" style="display: none;">
                    <div class="pill-box text-center">
                        <i class="fa-solid fa-scissors text-gold mb-2" style="font-size: 2rem;"></i>
                        <p class="text-white">لم تقم بإضافة خدمات بعد</p>
                        <button class="btn btn-outline-gold btn-sm">+ إضافة خدمة جديدة</button>
                    </div>
                </div>
            </div>
        `;
    },

    // --- لوحة تحكم المدير (خاصة بك يا بطل) ---
    renderAdminDashboard() {
        return `
            ${this.renderTopHeader('إدارة BarberGo')}
            <div class="container py-3">
                <div class="pill-box mb-4 text-center border-gold">
                    <h5 class="text-muted">إجمالي دخل المنصة من الاشتراكات</h5>
                    <h2 class="text-gold">${db.adminSettings.platformRevenue} JOD</h2>
                </div>

                <div class="pill-box text-right mb-4">
                    <h5 class="text-gold mb-3">إعدادات التحصيل (أموالك)</h5>
                    <p class="small text-muted">هذه البيانات تظهر للحلاقين عند الدفع لتجديد اشتراكهم.</p>
                    <div class="mb-3">
                        <label class="small">اسم المستخدم على CliQ</label>
                        <input type="text" id="admin-cliq" class="form-control text-left" value="${db.adminSettings.payoutDetails.cliq}">
                    </div>
                    <div class="mb-3">
                        <label class="small">رقم محفظة زين كاش / أورنج</label>
                        <input type="text" id="admin-wallet" class="form-control text-left" value="${db.adminSettings.payoutDetails.wallet}">
                    </div>
                    <button class="btn btn-primary w-100" onclick="app.saveAdminPayoutDetails()">تحديث بياناتي</button>
                </div>

                <div class="list-group">
                    <div class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                        عدد الصالونات المشتركة
                        <span class="badge bg-gold text-dark">${db.barbers.length}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderMiniChart() {
        return [30, 50, 80, 60, 90, 40, 70].map(h => `
            <div style="background: var(--gold-gradient); width: 10%; height: ${h}%; border-radius: 4px;"></div>
        `).join('');
    }
};

// تشغيل التطبيق
window.onload = () => app.init();
