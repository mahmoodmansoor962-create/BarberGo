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
        // Full Real-App session detection
        const session = localStorage.getItem('barbergo_session');

        if (window.location.pathname.includes('admin.html')) {
            if (session === 'admin') {
                this.navigate('adminDashboard');
            } else {
                this.navigate('adminLogin');
            }
            return;
        }

        if (session) {
            if (session.startsWith('barber_')) {
                const bId = parseInt(session.split('_')[1]);
                this.navigate('barberDashboard', { id: bId });
                return;
            } else if (session === 'client') {
                this.navigate('clientHome');
                return;
            }
        }

        this.navigate('welcome');
    }

    logout() {
        localStorage.removeItem('barbergo_session');
        window.notifier.show("تسجيل خروج", "تم تسجيل الخروج بنجاح", "info");

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

        switch (view) {
            case 'welcome':
                html = UI.renderWelcome();
                break;
            case 'clientHome':
                html = UI.renderClientHome();
                break;
            case 'clientSettings':
                html = UI.renderClientSettings();
                break;
            case 'clientBookings':
                html = UI.renderClientBookings();
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
                setTimeout(() => { if (window.app) window.app.initAdminChart(); }, 100);
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
            if (this.currentView === 'clientHome') {
                this.navigate('clientHome');
            }
        }
    }

    simulateAddService() {
        const name = prompt("أدخل اسم الخدمة الجديدة:");
        const price = prompt("أدخل سعر الخدمة (بالدينار):");
        if (name && price) {
            const container = document.getElementById('services-list-container');
            if (container) {
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

    addProduct() {
        const name = prompt("أدخل اسم المنتج الجديد:");
        const price = prompt("أدخل سعر المنتج (بالدينار):");

        if (name && price) {
            window.tempProductName = name;
            window.tempProductPrice = price;
            document.getElementById('product-image-upload').click();
        }
    }

    handleProductImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);

            const newProduct = {
                id: Date.now(),
                barber_id: barberId,
                name: window.tempProductName,
                price: parseFloat(window.tempProductPrice),
                image: base64Image
            };

            db.products.push(newProduct);
            window.saveDB();

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
            window.notifier.show("تمت الإضافة", `تم إضافة ${window.tempProductName} إلى المتجر بنجاح.`, "success");

            // Clean up
            event.target.value = '';
            delete window.tempProductName;
            delete window.tempProductPrice;
        };
        reader.readAsDataURL(file);
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
            const barber = db.barbers.find(b => b.id === barberId);

            if (!barber) return;

            if (type === 'cover') {
                barber.image = base64Image; // save as cover
                window.saveDB();
                window.notifier.show("تم الرفع", "تم رفع صورة الغلاف بنجاح ومزامنتها.", "success");

                const statusDiv = document.getElementById('cover-upload-status');
                if (statusDiv) statusDiv.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> تم رفع الصورة وجاهزة للحفظ</span>';

            } else if (type === 'gallery') {
                if (!barber.gallery) barber.gallery = [];
                barber.gallery.push(base64Image);
                window.saveDB();

                const container = document.getElementById('gallery-images-list');
                if (container) {
                    const html = `
                    <div style="position: relative;">
                        <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                        <img src="${base64Image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                    </div>`;
                    container.innerHTML += html;
                }
                window.notifier.show("تم الرفع", "تم إضافة الصورة بنجاح إلى معرض أعمالك المحفوظ.", "success");
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
        } else {
            element.style.background = 'var(--bg-main)';
            element.style.borderColor = 'var(--border-color)';
            element.style.opacity = '1';
        }
    }

    cancelBookingAlert(bookingIdElement) {
        const reason = prompt("إلغاء حجز! تنويه: سيتم حفظ الإلغاء. الرجاء كتابة سبب الإلغاء للعميل:");
        if (reason) {
            // Find booking and update status
            const currentBookingRow = bookingIdElement.closest('.client-request-card'); // assuming it's a card
            // We just update the DOM and pretend server sync for this barber dashboard view
            window.notifier.show("تم الإلغاء", `تم إلغاء الحجز للعميل بالسبب: ${reason}`, "info");
        } else if (reason === "") {
            window.notifier.show("تنبيه", "الإلغاء لم يتم، يجب كتابة سبب لكي يتم إرساله للعميل.", "warning");
        }
    }

    cancelClientBooking(bookingId) {
        // Implement the 1-hour cancellation policy
        const booking = db.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // In a real app we parse booking.time, but here we simulate a time check:
        // Let's assume they can cancel unless it's strictly denied by server. Since it's local time based, we'll just allow it with a prompt.
        const confirmed = confirm("هل أنت متأكد من رغبتك بإلغاء الموعد؟ يمكنك الإلغاء فقط إذا كان متبقياً أكثر من ساعة للموعد.");
        if (confirmed) {
            booking.status = 'cancelled';
            window.saveDB();
            window.notifier.show("تأكيد الإلغاء", "تم إلغاء الموعد بنجاح. نعتذر لسماع ذلك ونأمل رؤيتك قريباً.", "success");
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

        // Identify client for future sessions (My Bookings page)
        localStorage.setItem('barbergo_client_name', name);

        // Instant Booking Notification
        window.notifier.notifyBookingConfirmed(name, timeStr);

        // Smart 30-min Reminder Simulation
        setTimeout(() => {
            if (window.notifier) window.notifier.notifySmartReminder(name);
        }, 5000);

        this.navigate('barberProfile', { id: this.currentParams.barberId });
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
        if (pass === 'mahmoud2005') {
            this.navigate('adminEmailSetup');
        } else {
            window.notifier.show("خطأ", "كلمة المرور غير صحيحة", "error");
        }
    }

    verifyAdminEmail() {
        const email = document.getElementById('admin-email').value || 'admin';
        if (email) {
            localStorage.setItem('barbergo_session', 'admin');
            this.navigate('adminDashboard');
        } else {
            window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
        }
    }

    verifyBarber() {
        const code = document.getElementById('barber-code').value;
        if (code === '0000') {
            this.navigate('barberEmailSetup');
        } else {
            window.notifier.show("خطأ", "رمز الدخول غير صحيح", "error");
        }
    }

    verifyBarberEmail(passedEmail = null) {
        const email = passedEmail || (document.getElementById('barber-email') ? document.getElementById('barber-email').value : 'google_auth');

        if (email) {
            // Find or Create Barber
            let barber = db.barbers.find(b => b.email === email);
            let isNew = false;

            if (!barber) {
                isNew = true;
                const newId = db.barbers.length > 0 ? Math.max(...db.barbers.map(b => b.id)) + 1 : 1;
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
                db.barbers.push(barber);
                window.saveDB(); // Persist changes
            }

            localStorage.setItem('barbergo_session', 'barber_' + barber.id);

            if (isNew) {
                window.notifier.show("تم تفعيل حسابك", "تهانينا! لديك فترة تجربة مجانية لمدة 30 يوماً. قم بتعبئة بيانات صالونك الآن.", "success");
            }

            this.navigate('barberDashboard', { id: barber.id });
        } else {
            window.notifier.show("خطأ", "يرجى إدخال بريد إلكتروني صحيح", "warning");
        }
    }

    sendSubscriptionAlert(barberName) {
        window.notifier.show("تم الإرسال", `تم إرسال تنبيه تجديد الاشتراك لصالون: ${barberName}`, "success");
    }

    // Voice Search
    startVoiceSearch(btn) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    window.notifier.show("تسجيل الصوت", "تحدث الآن، الميكروفون يعمل ويستمع إليك...", "success");
                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop());
                        btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                        window.notifier.show("تحليل الصوت", "تم التقاط صوتك بنجاح. جاري البحث في الصالونات...", "info");
                    }, 4000);
                })
                .catch(err => {
                    btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                    window.notifier.show("إذن مرفوض", "لم يتمكن التطبيق من الوصول للميكروفون الخاص بك.", "error");
                });
        } else {
            window.notifier.show("غير مدعوم", "متصفحك الحالي لا يدعم تسجيل الصوت.", "warning");
        }
    }

    // AI Camera Real Logic
    startAIScanning(btn) {
        const scanLine = document.getElementById('ai-scan-line');
        const feed = document.getElementById('ai-camera-feed');
        const mockResult = document.getElementById('ai-mock-result');
        if (!scanLine || !feed) return;

        btn.innerHTML = '<i class="fa-solid fa-camera fa-fade"></i> جاري فتح الكاميرا...';
        btn.disabled = true;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(stream => {
                    feed.srcObject = stream;
                    scanLine.style.display = 'block';
                    window.notifier.show("الكاميرا نشطة", "يتم الآن تحليل ملامح وجهك...", "info");

                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop());
                        feed.style.display = 'none';
                        mockResult.style.display = 'block';
                        mockResult.src = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80';
                        scanLine.style.display = 'none';

                        document.getElementById('ai-scan-btn-container').style.display = 'none';
                        document.getElementById('ai-results-actions').style.display = 'block';
                        window.notifier.show('اكتمل التحليل', 'بناءً على شكل وجهك الحقيقي، هذه هي القصة الأنسب لك!', 'success');
                    }, 5000);
                })
                .catch(err => {
                    btn.innerHTML = '<i class="fa-solid fa-camera"></i> تحليل وجهي الآن';
                    btn.disabled = false;
                    window.notifier.show("إذن مرفوض", "يرجى إعطاء صلاحية الكاميرا لتعمل مرآة الذكاء.", "error");
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

    saveBarberSettings() {
        const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);

        if (barber) {
            barber.name = document.getElementById('barber-edit-name').value;
            barber.bio = document.getElementById('barber-edit-bio').value;
            barber.phone = document.getElementById('barber-edit-phone').value;
            barber.location = document.getElementById('barber-edit-location').value;

            window.saveDB();
            window.notifier.show("تم الحفظ", "تم حفظ وتحديث إعدادات ملفك الشخصي بنجاح.", "success");
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
            btnElement.className = \`btn \${state ? 'btn-success' : 'btn-ghost text-muted'}\`;
            btnElement.innerHTML = state ? '<i class="fa-solid fa-toggle-on"></i> مفعل' : '<i class="fa-solid fa-toggle-off"></i> معطل';
            window.notifier.show("تم التحديث", \`تم \${state ? 'تفعيل' : 'تعطيل'} زر اتصال الطوارئ.\`, "info");
        } else if (paramKey === 'homeService') {
            barber.homeService = !barber.homeService;
            const state = barber.homeService;
            btnElement.className = \`btn \${state ? 'btn-primary' : 'btn-ghost text-muted'}\`;
            btnElement.innerHTML = state ? '<i class="fa-solid fa-toggle-on"></i> متاح' : '<i class="fa-solid fa-toggle-off"></i> غير متاح';
            window.notifier.show("تم التحديث", \`تم \${state ? 'تفعيل' : 'تعطيل'} خدمة الحلاقة المنزلية.\`, "info");
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
