// Application Logic and Component Router for BarberGo

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.currentView = 'welcome';
        this.currentParams = {};
        this.language = 'ar'; // Default language
        this.init();
    }

    init() {
        // Mock socket connection simulation
        window.dbService.subscribeToBookings(1, (changes) => {
            changes.forEach(change => {
                if (change.type === 'added' && change.data.status === 'pending') {
                    console.log("[WebSockets] Barber received booking alert!");
                }
            });
        });

        // Add delayed free slot broadcast
        setTimeout(() => {
            if(window.notifier && this.currentView !== 'adminDashboard') {
                window.notifier.notifyFreeSlotBroadcast('03:30 م');
            }
        }, 12000);

        if (window.location.pathname.includes('admin.html')) {
            this.navigate('adminLogin');
        } else {
            this.navigate('welcome');
        }
    }

    navigate(view, params = {}) {
        this.currentView = view;
        this.currentParams = params;
        
        let html = '';

        switch(view) {
            case 'welcome':
                html = UI.renderWelcome();
                break;
            case 'clientHome':
                html = UI.renderClientHome();
                break;
            case 'clientSettings':
                html = UI.renderClientSettings();
                break;
            case 'barberProfile':
                html = UI.renderBarberProfile(params.id || 1);
                break;
            case 'bookingFlow':
                html = UI.renderBookingFlow(params.barberId, params.serviceId);
                break;
            case 'aiCamera':
                html = UI.renderAICamera();
                break;
            case 'barberLogin':
                html = UI.renderBarberLogin();
                break;
            case 'barberEmailSetup':
                html = UI.renderBarberEmailSetup();
                break;
            case 'barberDashboard':
                html = UI.renderBarberDashboard(params.id || 1);
                break;
            case 'adminLogin':
                html = UI.renderAdminLogin();
                break;
            case 'adminEmailSetup':
                html = UI.renderAdminEmailSetup();
                break;
            case 'adminDashboard':
                html = UI.renderAdminDashboard();
                setTimeout(() => { if(window.app) window.app.initAdminChart(); }, 100);
                break;
            default:
                html = UI.renderWelcome();
        }

        this.appElement.innerHTML = html;
        window.scrollTo(0, 0);
    }

    // Interactions & Routing Helpers
    toggleLanguage() {
        this.language = this.language === 'ar' ? 'en' : 'ar';
        // In a real app we'd load translations. Here we just swap direction & show toast.
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.language;
        const msg = this.language === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Language switched to English';
        window.notifier.show("تغيير اللغة", msg, "info");
        // Re-render current view to apply language changes (visually simulated for now)
        this.navigate(this.currentView, this.currentParams); 
    }

    requestLocation() {
        window.notifier.show("تحديد الموقع", "تم تحديد موقعك الجغرافي بنجاح. يتم الآن عرض أقرب الحلاقين إليك.", "success");
    }

    toggleFavorite(id) {
        const barber = window.db.barbers.find(b => b.id === id);
        if (barber) {
            barber.isFavorite = !barber.isFavorite;
            const msg = barber.isFavorite ? "تم إضافة الحلاق إلى مفضلتك." : "تم إزالة الحلاق من مفضلتك.";
            const type = barber.isFavorite ? "success" : "info";
            window.notifier.show("المفضلة", msg, type);
            // Re-render home to sort favorites
            if(this.currentView === 'clientHome') {
                this.navigate('clientHome');
            }
        }
    }

    simulateAddService() {
        const name = prompt("أدخل اسم الخدمة الجديدة:");
        const price = prompt("أدخل سعر الخدمة (بالدينار):");
        if(name && price) {
            const container = document.getElementById('services-list-container');
            if(container) {
                const html = `
                <div class="pill-box p-3 mb-2 d-flex justify-content-between align-items-center" style="border-left: 3px solid var(--gold-primary);">
                    <div class="text-right">
                        <h4 class="m-0 text-white">${name}</h4>
                        <div class="text-muted" style="font-size: 0.85rem; margin-top: 5px;"><i class="fa-regular fa-clock"></i> 30 دقيقة | <i class="fa-solid fa-tag"></i> JOD ${price}</div>
                    </div>
                    <button class="btn btn-ghost text-danger p-2" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                </div>`;
                container.innerHTML += html;
            }
            window.notifier.show("تمت الإضافة", `تمت إضافة خدمة ${name} بقيمة ${price} JOD بنجاح.`, "success");
        }
    }

    simulateAddProduct() {
        const name = prompt("أدخل اسم المنتج الجديد:");
        const price = prompt("أدخل سعر المنتج (بالدينار):");
        const imgUrl = prompt("أدخل رابط صورة المنتج (أو اتركه فارغاً لوضع صورة افتراضية):");
        if(name && price) {
            const container = document.getElementById('store-products-list');
            if(container) {
                const finalImgUrl = imgUrl || "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=60";
                const html = `
                <div class="pill-box p-2 text-center" style="position: relative;">
                    <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                    <img src="${finalImgUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                    <h4 class="text-white m-0" style="font-size: 0.95rem;">${name}</h4>
                    <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">${price} JOD</div>
                </div>`;
                container.innerHTML += html;
            }
            window.notifier.show("تمت الإضافة", `تم إضافة ${name} إلى المتجر بنجاح.`, "success");
        }
    }

    simulateAddGalleryImage() {
        const imgUrl = prompt("أدخل رابط الصورة لمعرض الأعمال (يجب أن يكون رابط إنترنت صحيح):");
        if(imgUrl) {
            const container = document.getElementById('gallery-images-list');
            if(container) {
                const html = `
                <div style="position: relative;">
                    <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                    <img src="${imgUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                </div>`;
                container.innerHTML += html;
            }
            window.notifier.show("تم الرفع", "تم إضافة الصورة بنجاح إلى معرض أعمالك.", "success");
        }
    }

    toggleBlockTime(element) {
        element.classList.toggle('selected');
        element.classList.toggle('blocked-slot');
        if(element.classList.contains('blocked-slot')) {
            element.style.background = '#e74c3c';
            element.style.borderColor = '#e74c3c';
            element.style.opacity = '0.8';
        } else {
            element.style.background = 'var(--bg-main)';
            element.style.borderColor = 'var(--border-color)';
            element.style.opacity = '1';
        }
    }

    cancelBookingAlert() {
        const reason = prompt("إلغاء حجز! تنويه: سيتم إرسال إشعار فوري للعميل. الرجاء كتابة سبب الإلغاء:");
        if(reason) {
            window.notifier.show("تم الإلغاء", `تم إلغاء الحجز وتنبيه العميل بالسبب: ${reason}`, "info");
            // Here in a real app we'd broadcast the cancellation event to the client
        } else if(reason === "") {
            window.notifier.show("تنبيه", "الإلغاء لم يتم، يجب كتابة سبب لكي يتم إرساله للعميل.", "warning");
        }
    }

    selectTime(element) {
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        if (!element.classList.contains('disabled')) {
            element.classList.add('selected');
        }
    }

    async confirmBooking() {
        const name = document.getElementById('customer-name').value;
        const selectedSlot = document.querySelector('.time-slot.selected');
        
        if (!name || name.split(' ').length < 2) {
            window.notifier.show("خطأ", "الرجاء إدخال الاسم الثنائي.", "error");
            return;
        }
        if (!selectedSlot) {
            window.notifier.show("تنبيه", "الرجاء اختيار وقت متاح.", "warning");
            return;
        }

        const timeStr = selectedSlot.innerText;

        await window.dbService.bookAppointment({
            customer_name: name,
            time: timeStr,
            date: new Date().toISOString()
        });

        // Instant Booking Notification
        window.notifier.notifyBookingConfirmed(name, timeStr);

        // Smart 30-min Reminder Simulation
        setTimeout(() => {
            if(window.notifier) window.notifier.notifySmartReminder(name);
        }, 5000);

        this.navigate('barberProfile', {id: this.currentParams.barberId}); 
    }

    triggerEmergency() {
        window.notifier.show("حالة طارئة 🚨", "تم إرسال طلب حجز طارئ للحلاق. يرجى الانتظار للموافقة الفورية.", "error", true);
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

        if(document.getElementById('tab-' + tabId)) {
            document.getElementById('tab-' + tabId).classList.add('active');
            let contentEl = document.getElementById('tab-content-' + tabId);
            if(contentEl) {
                contentEl.style.display = tabList[tabId] === 'products-grid' ? 'grid' : tabList[tabId] || 'block';
            }
        }
    }

    switchBarberDashboardTab(tabId) {
        document.querySelectorAll('.bdash-tab-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.bdash-content').forEach(el => el.style.display = 'none');

        if(document.getElementById('bdash-tab-' + tabId)) {
            document.getElementById('bdash-tab-' + tabId).classList.add('active');
            let contentEl = document.getElementById('bdash-content-' + tabId);
            if(contentEl) contentEl.style.display = 'block';
        }
    }

    simulateNotification() {
        window.notifier.show("إشعار تجريبي", "الإشعارات اللحظية تعمل بنجاح.", "info", true);
    }

    simulateNotificationError(msg) {
        window.notifier.show("تنبيه", msg, "error");
    }

    rateBarber(rating, element) {
        const stars = element.parentElement.children;
        for (let i = 0; i < stars.length; i++) {
            if (i < rating) {
                stars[i].classList.remove('fa-regular');
                stars[i].classList.add('fa-solid');
            } else {
                stars[i].classList.remove('fa-solid');
                stars[i].classList.add('fa-regular');
            }
        }
    }

    toggleSetting(settingName) {
        window.notifier.show("تحديث الإعدادات", `تم بنجاح تغيير حالة: ${settingName}`, "success");
    }

    // Admin Auth
    verifyAdmin() {
        const pass = document.getElementById('admin-password').value;
        if(pass === 'mahmoud2005') { 
            this.navigate('adminEmailSetup');
        } else {
            window.notifier.show("خطأ", "كلمة المرور غير صحيحة", "error");
        }
    }

    verifyAdminEmail() {
        const email = document.getElementById('admin-email').value;
        if(email && email.includes('@')) {
            this.navigate('adminDashboard');
        } else {
            window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
        }
    }

    verifyBarber() {
        const code = document.getElementById('barber-code').value;
        if(code === '0000') {
            this.navigate('barberEmailSetup');
        } else {
            window.notifier.show("خطأ", "رمز الدخول غير صحيح", "error");
        }
    }

    verifyBarberEmail() {
        const email = document.getElementById('barber-email').value;
        if(email && email.includes('@')) {
            this.navigate('barberDashboard', {id: 1});
        } else {
            window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
        }
    }

    sendSubscriptionAlert(barberName) {
        window.notifier.show("تم الإرسال", `تم إرسال تنبيه تجديد الاشتراك لصالون: ${barberName}`, "success");
    }

    // AI Camera Simulation
    startAIScanning(btn) {
        const scanLine = document.getElementById('ai-scan-line');
        const feed = document.getElementById('ai-camera-feed');
        if(!scanLine || !feed) return;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل...';
        btn.disabled = true;
        scanLine.style.display = 'block';
        
        setTimeout(() => {
            scanLine.style.display = 'none';
            // Show the recommended AI haircut image
            feed.src = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80';
            
            document.getElementById('ai-scan-btn-container').style.display = 'none';
            document.getElementById('ai-results-actions').style.display = 'block';
            window.notifier.show('اكتمل التحليل', 'بناءً على شكل وجهك، هذه هي القصة الأنسب لك!', 'success');
        }, 3000);
    }

    showAdminPayoutDetails() {
        const payout = db.adminSettings.payoutDetails;
        let details = "يمكنك تجديد اشتراكك عبر وسائل الدفع التالية الخاصة بالمدير العام:\n\n";
        
        if(payout.cliq) details += `📱 كليك (CliQ): ${payout.cliq}\n`;
        if(payout.wallet) details += `💳 المحفظة: ${payout.wallet}\n`;
        
        if(payout.bankIban || payout.accountHolder) {
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
        if(!barber || !barber.paymentMethods) return;

        let details = "لراحتك، يمكنك الدفع مسبقاً براحة تامة، أو الدفع نقداً بالصالون.\n\n";
        if(barber.paymentMethods.cliq) details += `📱 كليك (CliQ): ${barber.paymentMethods.cliq}\n`;
        if(barber.paymentMethods.wallet) details += `💳 محفظة: ${barber.paymentMethods.wallet}\n`;
        if(barber.paymentMethods.visa) details += `✅ الدفع بالبطاقة بالصالون متاح\n`;
        
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
        if(!ctx || !window.Chart) return;
        
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
        if(barber) {
            const isBlocked = barber.subscriptionStatus === 'blocked';
            barber.subscriptionStatus = isBlocked ? 'active' : 'blocked';
            
            if(barber.subscriptionStatus === 'blocked') {
                btnElement.classList.replace('btn-primary', 'btn-danger');
                btnElement.innerHTML = '<i class="fa-solid fa-lock"></i> محظور';
                window.notifier.show("تم الحظر", `تم إيقاف حساب ${barber.name} بنجاح.`, "error");
            } else {
                btnElement.classList.replace('btn-danger', 'btn-primary');
                btnElement.innerHTML = '<i class="fa-solid fa-lock-open"></i> تفعيل';
                window.notifier.show("تم التفعيل", `تم إعادة تفعيل حساب ${barber.name}.`, "success");
            }
        }
    }

    savePayoutDetails() {
        const iban = document.getElementById('admin-iban').value;
        const bank = document.getElementById('admin-bank').value;
        if(iban && bank) {
            window.notifier.show("تم الحفظ", "تم ربط وتحديث معلومات استقبال الإيرادات بنجاح.", "success");
        } else {
            window.notifier.show("خطأ", "الرجاء تعبئة جميع الحقول المطلوبة.", "warning");
        }
    }

    updateSubscriptionPrice() {
        window.notifier.show("تم التحديث", "تم حفظ أسعار الاشتراكات الجديدة كباقة أساسية للصالونات.", "success");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
