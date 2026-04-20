// ==========================================
// BarberGo - المحرك الأساسي (app.js)
// ==========================================

const app = {
    // تشغيل التطبيق أول مرة
    init() {
        console.log("BarberGo Started...");
        this.navigate('welcome');
    },

    // وظيفة التنقل بين الصفحات
    navigate(page, data = null) {
        const appContainer = document.getElementById('app'); // هذا هو الـ ID الموجود في ملف الـ HTML تبعك
        
        if (!appContainer) {
            console.error("خطأ: لم يتم العثور على عنصر id='app' في ملف HTML");
            return;
        }

        switch(page) {
            case 'welcome':
                appContainer.innerHTML = UI.renderWelcome();
                break;
            case 'barberLogin':
                // تحويل مباشر للوحة الحلاق للتجربة الآن
                appContainer.innerHTML = UI.renderBarberDashboard(1);
                break;
            case 'adminLogin':
                appContainer.innerHTML = UI.renderAdminDashboard();
                break;
            case 'clientHome':
                appContainer.innerHTML = `<div class="text-center py-5"><h2 class="text-gold">قريباً.. واجهة الزبائن</h2><button class="btn btn-primary" onclick="app.navigate('welcome')">رجوع</button></div>`;
                break;
            default:
                appContainer.innerHTML = UI.renderWelcome();
        }
    },

    // تبديل التبويبات داخل لوحة الحلاق
    switchTab(tabId) {
        // إخفاء كل المحتويات
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        // إظهار المحتوى المختار
        const activeTab = document.getElementById(`tab-content-${tabId}`);
        if (activeTab) activeTab.style.display = 'block';
        
        // تغيير شكل الأزرار (اختياري)
        console.log("Switched to tab: " + tabId);
    }
};

// تشغيل التطبيق فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
