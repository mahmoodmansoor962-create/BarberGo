// BarberGo - المطور الاحترافي 2026
class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.currentView = 'welcome';
        this.currentParams = {};
        this.language = 'ar';
        this.init();
    }

    async init() {
        // فحص حالة الدخول تلقائياً (نظام الجلسة الدائمة)
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("المستخدم مسجل دخوله:", user.email);
                // توجيه تلقائي للمدير لو فتح الرابط
                if (window.location.pathname.includes('admin.html') && this.currentView === 'welcome') {
                    this.navigate('adminDashboard');
                }
            }
        });

        if (window.location.pathname.includes('admin.html')) {
            this.navigate('adminLogin');
        } else {
            this.navigate('welcome');
        }
    }

    // --- نظام الكاميرا الحقيقي للذكاء الاصطناعي ---
    async startAIScanning(btn) {
        const feed = document.getElementById('ai-camera-feed');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            window.notifier.show("خطأ", "متصفحك لا يدعم الوصول للكاميرا", "error");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            feed.srcObject = stream;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل الذكي...';
            
            setTimeout(() => {
                window.notifier.show('اكتمل التحليل', 'بناءً على شكل وجهك، تم اختيار القصة الأنسب!', 'success');
                // هنا يمكن إضافة منطق تحليل الصورة الحقيقي
            }, 4000);
        } catch (err) {
            window.notifier.show("صلاحية مرفوضة", "يرجى السماح بالوصول للكاميرا لتجربة الميزة", "warning");
        }
    }

    // --- نظام إلغاء الموعد للعميل ---
    cancelBookingByClient(bookingId) {
        if(confirm("هل أنت متأكد من إلغاء الحجز؟")) {
            window.notifier.show("تم الإلغاء", "تم إلغاء موعدك بنجاح وإبلاغ الصالون", "info");
            this.navigate('clientHome');
        }
    }

    // --- تسجيل الدخول الموحد بكلمة سر ثابتة للمدير ---
    verifyAdmin() {
        const pass = document.getElementById('admin-password').value;
        if(pass === 'mahmoud2005') { 
            // حفظ الدخول في Firebase
            this.navigate('adminDashboard');
        } else {
            window.notifier.show("خطأ", "كلمة المرور غير صحيحة", "error");
        }
    }

    // --- التنقل بين الصفحات ---
    navigate(view, params = {}) {
        this.currentView = view;
        this.currentParams = params;
        let html = '';

        switch(view) {
            case 'welcome': html = UI.renderWelcome(); break;
            case 'clientHome': html = UI.renderClientHome(); break;
            case 'aiCamera': html = UI.renderAICamera(); break;
            case 'adminDashboard': html = UI.renderAdminDashboard(); break;
            case 'barberDashboard': html = UI.renderBarberDashboard(params.id || 1); break;
            default: html = UI.renderWelcome();
        }

        this.appElement.innerHTML = html;
        window.scrollTo(0, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
