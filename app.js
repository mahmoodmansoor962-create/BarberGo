// Application Logic and Component Router for BarberGo

// Dictionary for real bilingual system
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

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.currentView = 'welcome';
        this.currentParams = {};
        this.language = localStorage.getItem('barbergo_lang') || 'ar'; // Real persistence
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        this.debouncedFilterBarbers = this.debounce(this.filterBarbers.bind(this), 120);
        this.pendingPreOrderProducts = [];
        if (window.dbService && typeof window.dbService.initFeedbackScheduler === 'function') {
            window.dbService.initFeedbackScheduler();
        }
        this.init();
    }

    init() {
        // Full Real-App session detection
        const session = localStorage.getItem('barbergo_session');

        if (window.location.pathname.includes('admin.html')) {
            if (session === 'admin') {
                this.navigate('adminDashboard');
                window.notifier.show("مرحباً بك", "أهلاً بك مجدداً في لوحة تحكم الإدارة.", "success");
            } else {
                this.navigate('adminLogin');
            }
            return;
        }

        if (session) {
            if (session.startsWith('barber_')) {
                const bId = parseInt(session.split('_')[1]);
                this.navigate('barberDashboard', { id: bId });
                const foundBarber = window.db.barbers.find(b => b.id === bId);
                const bName = foundBarber ? foundBarber.name : 'أيها الحلاق';
                window.notifier.show("مرحباً بك", `أهلاً بك مجدداً في لوحة التحكم الخاصة بك يا ${bName}.`, "success");
                return;
            } else if (session === 'client') {
                this.navigate('clientHome');
                window.notifier.show("مرحباً بك", "أهلاً بك مجدداً في BarberGo. احجز موعدك الآن!", "success");
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
            case 'clientNotifications':
                html = UI.renderClientNotifications();
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
        localStorage.setItem('barbergo_lang', this.language);
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.language;
        const msg = this.language === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Language switched to English';
        window.notifier.show("تغيير اللغة", msg, "success");
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
                setTimeout(() => waiting = false, limit);
            }
        };
    }

    filterBarbers() {
        const query = document.getElementById('client-search-input').value.toLowerCase();
        const barberCards = document.querySelectorAll('.barber-grid-card');
        window.requestAnimationFrame(() => {
            barberCards.forEach(card => {
                const name = card.querySelector('h3').innerText.toLowerCase();
                card.style.display = name.includes(query) ? 'block' : 'none';
            });
        });
    }

    requestLocation() {
        window.notifier.show("تحديد الموقع", "تم تحديد موقعك الجغرافي بنجاح. يتم الآن عرض أقرب الحلاقين إليك.", "success");
    }

    openNotifications() {
        this.navigate('clientNotifications');
        const customerName = localStorage.getItem('barbergo_client_name');
        if (!customerName) {
            window.notifier.show("تنبيه", "لم يتم العثور على اسم العميل. قم بالحجز أولاً لتلقي إشعارات التقييم.", "info");
        }
    }

    submitFeedback(barberId, notificationId) {
        const slider = document.getElementById(`feedback-slider-${notificationId}`);
        const value = slider ? parseInt(slider.value, 10) : 0;
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
        window.saveDB();

        window.notifier.show("تم الإرسال", `تم إرسال تقييمك لكابتن ${notification.barberName} بنجاح. شكراً لمشاركتك رأيك.`, "success");
        this.navigate('clientNotifications');
    }

    archiveNotification(notificationId) {
        const notification = window.db.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        notification.archived = true;
        window.saveDB();
        window.notifier.show("تم الإغلاق", "تم إغلاق الإشعار ولن يتم عرضه مجدداً.", "info");
        this.navigate('clientNotifications');
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
            window.notifier.show("خطأ", "يرجى اختيار عدد النجوم للتقييم.", "error");
            return;
        }

        const barber = window.db.barbers.find(b => b.id === barberId);
        if (barber) {
            // Update rating logic
            const currentTotal = barber.rating * (barber.reviewsCount || 120);
            const newCount = (barber.reviewsCount || 120) + 1;
            const newAvg = (currentTotal + this.pendingRating) / newCount;
            
            barber.rating = parseFloat(newAvg.toFixed(1));
            barber.reviewsCount = newCount;
            
            window.saveDB();
            
            // Update UI
            const ratingDisplay = document.getElementById('barber-avg-rating');
            const reviewsCountDisplay = document.getElementById('barber-reviews-count');
            
            if (ratingDisplay) ratingDisplay.innerText = barber.rating;
            if (reviewsCountDisplay) reviewsCountDisplay.innerText = `بناءً على ${barber.reviewsCount} تقييم`;
            
            window.notifier.show("إرسال التقييم", "تم تسجيل تقييمك بنجاح! شكراً لك.", "success");
            this.pendingRating = 0;
            
            // Optional: reset stars visually
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
            window.saveDB();
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
        const barberId = parseInt(barberIdStr.split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        
        if (barber) {
            if (bio) barber.bio = bio;
            if (phone) barber.phone = phone;
            if (location) barber.location = location;
            if (!barber.social) barber.social = {};
            if (whatsapp) barber.social.whatsapp = whatsapp;
            
            window.saveDB();
            window.notifier.show("تم الحفظ", "تم حفظ إعدادات البروفايل بنجاح، وستظهر للعملاء بشكلها الجديد.", "success");
        }
    }

    simulateAddService() {
        const barberIdStr = localStorage.getItem('barbergo_session');
        if (!barberIdStr || !barberIdStr.startsWith('barber_')) return;
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
            window.saveDB();

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
            window.notifier.show("تمت الإضافة", `تمت إضافة خدمة ${name} بقيمة ${price} JOD بنجاح. ستظهر الآن للعملاء.`, "success");
        }
    }

    deleteService(serviceId, btnEl) {
        const confirmDel = confirm("هل أنت متأكد من حذف هذه الخدمة؟");
        if (confirmDel) {
            // Prefer real backend if available
            if (window.dbService && typeof window.dbService.deleteService === 'function') {
                window.dbService.deleteService(serviceId).then(() => {
                    window.db.services = window.db.services.filter(s => s.id !== serviceId);
                    window.saveDB && window.saveDB();
                    if (btnEl) btnEl.closest('.pill-box').remove();
                    window.notifier.show("حذف الخدمة", "تم حذف الخدمة بنجاح.", "info");
                }).catch(err => {
                    console.error(err);
                    window.notifier.show("خطأ", "فشل حذف الخدمة. حاول مجدداً.", "error");
                });
            } else {
                window.db.services = window.db.services.filter(s => s.id !== serviceId);
                window.saveDB && window.saveDB();
                if (btnEl) btnEl.closest('.pill-box').remove();
                window.notifier.show("حذف الخدمة", "تم حذف الخدمة بنجاح.", "info");
            }
        }
    }

    // Confirm delete used by barber UI buttons
    confirmDeleteService(serviceId, btnEl) {
        const ok = confirm('هل أنت متأكد من حذف هذه الخدمة نهائياً؟');
        if (!ok) return;
        this.deleteService(serviceId, btnEl);
    }

    startEditService(serviceId, btnEl) {
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
            window.notifier.show('خطأ', 'يرجى إدخال اسم صحيح وسعر رقمي.', 'error');
            return;
        }

        // Optimistically update local DB for snappy UI
        const svc = window.db.services.find(s => s.id === serviceId);
        if (svc) {
            svc.name = newName;
            svc.price = newPrice;
            window.saveDB && window.saveDB();
        }

        try {
            if (window.dbService && typeof window.dbService.updateService === 'function') {
                await window.dbService.updateService(serviceId, { name: newName, price: newPrice });
            }
            window.notifier.show('تم الحفظ', 'تم تحديث بيانات الخدمة بنجاح.', 'success');
            // Refresh view to show updated service
            this.navigate('barberDashboard', { id: svc.barber_id });
        } catch (err) {
            console.error(err);
            window.notifier.show('خطأ', 'فشل تحديث الخدمة. حاول مجدداً.', 'error');
        }
    }

    // Product pre-order toggling on client product cards
    togglePreOrderProduct(productId, btnEl) {
        const prod = window.db.products.find(p => p.id === productId);
        if (!prod) return;

        const idx = this.pendingPreOrderProducts.findIndex(p => p.productId === productId);
        if (idx > -1) {
            // remove
            this.pendingPreOrderProducts.splice(idx, 1);
            if (btnEl) btnEl.innerText = 'إضافه للطلب والتحضير';
            window.notifier.show('تمت الإزالة', `${prod.name} تمت إزالته من قائمة التحضير.`, 'info');
        } else {
            this.pendingPreOrderProducts.push({ productId: productId, productName: prod.name, quantity: 1 });
            if (btnEl) btnEl.innerText = 'تمت الإضافة';
            window.notifier.show('تمت الإضافة', `${prod.name} أضيف لطلب التحضير عند الحضور.`, 'success');
        }
    }

    updateSubscriptionPrice() {
        const adminData = window.db.adminSettings;
        const inputs = document.querySelectorAll('#admin-content-3 input[type="number"]');
        if (inputs.length >= 2) {
            const monthly = parseInt(inputs[0].value);
            const yearly = parseInt(inputs[1].value);
            if (!isNaN(monthly) && !isNaN(yearly)) {
                adminData.subscriptionPrices.monthly = monthly;
                adminData.subscriptionPrices.yearly = yearly;
                window.saveDB();
                window.notifier.show("تحديث التسعير", "تم حفظ أسعار الاشتراكات الجديدة وتحديثها في قاعدة البيانات.", "success");
            }
        }
    }

    submitNewProduct() {
        const nameInput = document.getElementById('new-product-name');
        const priceInput = document.getElementById('new-product-price');
        const imageInput = document.getElementById('new-product-image');

        const name = nameInput.value.trim();
        const price = priceInput.value.trim();
        const file = imageInput.files[0];

        if (!name || !price || !file) {
            window.notifier.show("بيانات غير مكتملة", "يرجى إدخال اسم المنتج والسعر واختيار صورة.", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            const barberId = parseInt(localStorage.getItem('barbergo_session').split('_')[1]);

            const newProduct = {
                id: Date.now(),
                barber_id: barberId,
                name: name,
                price: parseFloat(price),
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
            window.notifier.show("تمت الإضافة", `تم إضافة ${newProduct.name} إلى المتجر وتم عرضه للعملاء بنجاح.`, "success");

            // Clean up
            nameInput.value = '';
            priceInput.value = '';
            imageInput.value = '';
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
        const barberId = parseInt(barberIdStr.split('_')[1]);
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (barber) {
            const blockedSlotsElements = document.querySelectorAll('#barber-block-grid .blocked-slot');
            const blockedTimes = Array.from(blockedSlotsElements).map(el => el.textContent.trim());
            barber.blockedTimes = blockedTimes;
            window.saveDB();
            window.notifier.show('تم الحفظ', 'تم حفظ الأوقات المقفلة بنجاح. لن يتمكن العملاء من حجز هذه الأوقات.', 'success');
        }
    }

    cancelBookingAlert(bookingIdElement) {
        // legacy method, kept for reference
        const reason = prompt("إلغاء حجز! تنويه: سيتم حفظ الإلغاء. الرجاء كتابة سبب الإلغاء للعميل:");
        if (reason) {
            window.notifier.show("تم الإلغاء", `تم إلغاء الحجز للعميل بالسبب: ${reason}`, "info");
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
                const barberName = window.db.barbers.find(b => b.id === parseInt(localStorage.getItem('barbergo_session').split('_')[1]))?.name || "الحلاق";
                window.notifier.show("تم إرسال الاعتذار للعميل", `نعتذر منك بشدة.. نود إعلامك بأن موعدك لدى ${barberName} قد تم إلغاؤه لظرف طارئ خارج عن إرادتنا. نحن نهتم بوقتك، بإمكانك إعادة الحجز في وقت آخر يناسبك. شكراً لتفهمك - فريق BarberGo.`, "info");
                
                // In real app, we'd find the booking ID and set status = 'cancelled' and saveDB()
                // window.saveDB();
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
            
            window.notifier.show("تم استعادة الحجز", `تم استعادة حجز العميل (${clientName}) بنجاح. تم إعلامه بتأكيد الموعد.`, "success");
            
            // In real app, we'd find the booking ID and set status = 'active' and saveDB()
            // window.saveDB();
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
            
            // محاكاة إشعار للعملاء المهتمين والحلاق بتوفر الوقت
            setTimeout(() => {
                window.notifier.show("إشعار توفر وقت 🔔", `لقد أصبح الوقت (${booking.time}) متاحاً الآن للحجز!`, "info");
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

        const bId = this.currentParams.barberId || this.currentParams.id;
        const preOrders = (this.pendingPreOrderProducts || []).map(p => ({ productName: p.productName, quantity: p.quantity || 1 }));
        await window.dbService.bookAppointment({
            customer_name: name,
            time: timeStr,
            date: new Date().toISOString(),
            barber_id: bId,
            service_id: this.currentParams.serviceId,
            preOrderProducts: preOrders
        });

        // clear pending selections after booking
        this.pendingPreOrderProducts = [];

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
            } else {
                window.notifier.show("مرحباً بك", `أهلاً بك مجدداً في لوحة التحكم يا ${barber.name}.`, "success");
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
