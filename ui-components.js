// Advanced UI Components and View Renderers for BarberGo

const UI = {
    renderTopHeader(title = 'BarberGo') {
        const langText = window.app && window.app.language === 'en' ? 'عربي' : 'English';
        return `
            <header class="top-header">
                <div class="container">
                    <div class="header-actions">
                        <button class="lang-btn" onclick="app.toggleLanguage()"><i class="fa-solid fa-globe"></i> ${langText}</button>
                        <button class="bell-btn" onclick="app.simulateNotification()">
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

    renderBottomNav(activeTab = 'home') {
        return `
            <div class="bottom-nav-container">
                <div class="bottom-nav">
                    <div class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="app.navigate('clientSettings')">
                        <i class="fa-solid fa-gear"></i>
                        <span>الإعدادات</span>
                    </div>
                    <div class="nav-item ${activeTab === 'bookings' ? 'active' : ''}" onclick="app.navigate('clientBookings')">
                        <i class="fa-solid fa-calendar-check"></i>
                        <span>مواعيدي</span>
                    </div>
                    <div class="nav-center-action" onclick="app.navigate('aiCamera')">
                        <i class="fa-solid fa-scissors"></i>
                    </div>
                    <div class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="app.navigate('clientHome')">
                        <i class="fa-solid fa-house"></i>
                        <span>الرئيسية</span>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 1. Client Features
    // ==========================================
    renderClientBookings() {
        const clientName = localStorage.getItem('barbergo_client_name') || null;
        let myBookingsHTML = '';

        if (!clientName) {
            myBookingsHTML = `
                <div class="pill-box text-center mt-5">
                    <i class="fa-regular fa-calendar-xmark text-muted mb-3" style="font-size: 3rem;"></i>
                    <h4 class="text-white">لا توجد مواعيد</h4>
                    <p class="text-muted" style="font-size: 0.9rem;">أنت لم تقم بأي حجز بعد باستخدام هذا الجهاز.</p>
                    <button class="btn btn-primary mt-3 w-100" onclick="app.navigate('clientHome')">احجز الآن</button>
                </div>
            `;
        } else {
            const clientBookings = db.bookings.filter(b => b.customer_name === clientName);
            if (clientBookings.length === 0) {
                myBookingsHTML = `
                    <div class="pill-box text-center mt-5">
                        <i class="fa-regular fa-calendar-xmark text-muted mb-3" style="font-size: 3rem;"></i>
                        <h4 class="text-white">لا توجد مواعيد حالية</h4>
                        <button class="btn btn-primary mt-3 w-100" onclick="app.navigate('clientHome')">احجز الآن</button>
                    </div>
                `;
            } else {
                myBookingsHTML = clientBookings.map(b => {
                    const barber = db.barbers.find(barb => barb.id === b.barber_id);
                    // Check logic for cancellation (assume the booked date is today for UI logic)
                    // If booking time logic: allow cancel if time left is > 1 hour. We simulate this logic simply:
                    return `
                    <div class="pill-box mb-3 d-flex justify-content-between align-items-center" style="border-left: 3px solid ${b.status === 'cancelled' ? '#e74c3c' : 'var(--gold-primary)'};">
                        <div class="text-right">
                            <h4 class="m-0 text-white">${barber ? barber.name : 'صالون'}</h4>
                            <div class="text-muted mt-1" style="font-size: 0.85rem;"><i class="fa-regular fa-clock"></i> الوقت: ${b.time}</div>
                            <div class="mt-1" style="font-size: 0.85rem; color: ${b.status === 'cancelled' ? '#e74c3c' : '#2ecc71'};">
                                <i class="fa-solid fa-circle-check"></i> ${b.status === 'cancelled' ? 'تم الإلغاء' : 'مؤكد'}
                            </div>
                        </div>
                        ${b.status !== 'cancelled' ? `
                        <button class="btn btn-outline text-danger p-2" style="border-color: #e74c3c; font-size: 0.8rem;" onclick="app.cancelClientBooking(${b.id})">
                            <i class="fa-solid fa-xmark"></i> إلغاء
                        </button>
                        ` : ''}
                    </div>
                    `;
                }).join('');
            }
        }

        return `
            ${this.renderTopHeader('مواعيدي')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                <h3 class="text-right mb-4 text-gold">سجل حجوزاتك <i class="fa-solid fa-clock-rotate-left"></i></h3>
                ${myBookingsHTML}
            </div>
            ${this.renderBottomNav('bookings')}
        `;
    },

    renderClientHome() {
        // Sort barbers so that favorites are on top
        const sortedBarbers = [...db.barbers].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });

        const barbersHtml = sortedBarbers.map(b => `
            <div class="barber-grid-card" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 15px; border: 1px solid var(--border-color); text-align: center;">
                <div style="position: relative; cursor: pointer;">
                    <div class="favorite-btn" onclick="event.stopPropagation(); app.toggleFavorite(${b.id})" style="position: absolute; top: 10px; right: 10px; color: ${b.isFavorite ? '#e74c3c' : '#fff'}; font-size: 1.5rem; z-index: 2; transition: all 0.2s; -webkit-text-stroke: ${b.isFavorite ? '0px' : '1px #888'};">
                        <i class="fa-${b.isFavorite ? 'solid' : 'regular'} fa-heart"></i>
                    </div>
                    <img src="${b.image}" alt="${b.name}" style="width: 100%; height: 130px; border-radius: 12px; object-fit: cover; margin-bottom: 12px; border: 2px solid var(--gold-primary);" onclick="app.navigate('barberProfile', { id: ${b.id} })">
                </div>
                <div onclick="app.navigate('barberProfile', { id: ${b.id} })" style="cursor: pointer;">
                    <h3 class="text-white mb-1" style="font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.name}</h3>
                    <div class="text-gold" style="font-size: 0.85rem;"><i class="fa-solid fa-star"></i> ${b.rating}</div>
                </div>
            </div>
        `).join('');

        return `
            ${this.renderTopHeader()}
            <div class="page" style="padding-bottom: 100px;">
                <div class="container py-4">
                    <div class="search-bar mb-4 d-flex align-items-center p-1" style="background: var(--bg-card); border: 2px solid var(--gold-primary); border-radius: var(--radius-lg); box-shadow: var(--shadow-gold);">
                        <button class="location-btn btn btn-ghost" style="border-radius: 50%; padding: 10px;" onclick="app.requestLocation()"><i class="fa-solid fa-location-dot"></i></button>
                        <input type="text" class="form-control" style="background: transparent; border: none; flex: 1; padding: 10px; color: #fff; text-align: right; outline: none; font-size: 1rem;" placeholder="ابحث باسم الحلاق أو بالصوت ...">
                        <button class="voice-btn btn btn-primary" style="border-radius: 50%; width: 50px; height: 50px; padding: 0;" onclick="app.startVoiceSearch(this)">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                    </div>
                    <h3 class="mb-3 text-right">صالونات مقترحة لك</h3>
                    <div class="barbers-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        ${barbersHtml}
                    </div>
                </div>
            </div>
            ${this.renderBottomNav('home')}
        `;
    },

    renderBarberProfile(barberId) {
        const barber = db.barbers.find(b => b.id === barberId);
        const services = db.services.filter(s => s.barber_id === barberId);

        const servicesHtml = services.map(s => `
            <div class="service-pill">
                <div class="service-details">
                    <div class="service-title">${s.name}</div>
                    <div class="service-meta">
                        <span>JOD ${s.price}</span> • MIN ${s.duration}
                    </div>
                </div>
                <div class="service-action">
                    <button class="btn btn-primary" onclick="app.navigate('bookingFlow', { barberId: ${barber.id}, serviceId: ${s.id} })">حجز الموعد</button>
                </div>
            </div>
        `).join('');

        const activeBookingsCount = db.bookings.filter(b => b.barber_id === barberId).length;
        const isCrowded = activeBookingsCount >= 2; // Threshold for demo
        const crowdHtml = isCrowded
            ? `<div class="pill-box mb-3 text-center mx-auto" style="border: 1px solid var(--gold-primary); background: rgba(212,175,55,0.05); padding: 10px; max-width: 80%;"><h4 class="m-0 text-gold" style="font-size: 0.95rem;"><i class="fa-solid fa-fire"></i> الوضع الحالي: مزدحم 🔥</h4></div>`
            : `<div class="pill-box mb-3 text-center mx-auto" style="border: 1px solid var(--gold-primary); background: rgba(212,175,55,0.05); padding: 10px; max-width: 80%;"><h4 class="m-0 text-gold" style="font-size: 0.95rem;"><i class="fa-regular fa-circle-check"></i> الوضع الحالي: هادئ - وقت مثالي 🟢</h4></div>`;

        return `
            ${this.renderTopHeader()}
            <div class="page" style="padding-bottom: 100px;">
                <div class="profile-cover"></div>
                <div class="container text-center">
                    <div class="profile-img-container">
                        <img src="${barber.image}" alt="${barber.name}">
                        <div class="verified-badge"><i class="fa-solid fa-star"></i></div>
                    </div>
                    
                    <h2 class="text-gold mb-1" style="font-size: 1.8rem; font-weight: 800;">${barber.name}</h2>
                    <div class="d-flex justify-content-center align-items-center gap-3 mb-2">
                        <div class="text-gold" style="font-size: 1.1rem;"><i class="fa-solid fa-star"></i> ${barber.rating}</div>
                    </div>
                    ${crowdHtml}
                    <p class="text-muted mb-4" style="font-size: 0.9rem;">"${barber.bio}"</p>
                    
                    <h3 class="text-right text-gold mb-3"><i class="fa-regular fa-calendar"></i> الحجز والخدمات</h3>
                    <div class="services-container mb-4">${servicesHtml}</div>

                    <div class="ai-camera-box pill-box pill-box-outline cursor-pointer" onclick="app.navigate('aiCamera')">
                        <div class="ai-icon"><i class="fa-solid fa-camera"></i></div>
                        <h3 class="text-gold mb-1">مرآة الذكاء الاصطناعي</h3>
                        <p class="text-muted" style="font-size: 0.8rem;">افتح الكاميرا لاكتشاف القصة المثالية</p>
                    </div>

                    <h3 class="text-right text-gold mb-3"><i class="fa-solid fa-map-location-dot"></i> الموقع والتواصل</h3>
                    
                    <div class="address-box">
                        <button class="btn btn-ghost" style="padding: 5px 10px; border: 1px solid var(--gold-primary); color: var(--gold-primary);"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
                        <div class="text-right">
                            <div class="text-muted" style="font-size: 0.8rem;">عنوان الصالون</div>
                            <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">${barber.location}</div>
                        </div>
                        <div class="address-icon"><i class="fa-solid fa-location-dot"></i></div>
                    </div>

                    <div class="social-icons-row mb-3">
                        <div class="social-icon call" onclick="window.location.href='tel:${barber.phone}'"><i class="fa-solid fa-phone"></i><span>Call</span></div>
                        <div class="social-icon whatsapp" onclick="window.open('https://wa.me/${barber.phone}')"><i class="fa-brands fa-whatsapp"></i><span>Whatsapp</span></div>
                        <div class="social-icon facebook"><i class="fa-brands fa-facebook-f"></i><span>FB</span></div>
                        <div class="social-icon instagram"><i class="fa-brands fa-instagram"></i><span>Insta</span></div>
                    </div>

                    ${barber.settings.enableEmergency ? `
                        <a href="tel:${barber.phone || '0790000000'}" class="pill-box text-decoration-none d-block cursor-pointer mb-3 text-center" style="border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.1);">
                            <h3 class="text-danger m-0 d-flex justify-content-center align-items-center gap-2">
                                <i class="fa-solid fa-phone-volume fa-shake"></i> اتصال طارئ بالحلاق!
                            </h3>
                            <p class="text-muted mt-2 mb-0" style="font-size: 0.8rem;">انقر هنا للاتصال والتنسيق المباشر (للحالات المستعجلة)</p>
                        </a>
                    ` : ''}

                    <div class="tabs-container mt-4" style="overflow-x: auto; white-space: nowrap; flex-wrap: nowrap;">
                        <div class="tab-item profile-tab-item active" id="tab-store" onclick="app.switchTab('store')">المتجر</div>
                        <div class="tab-item profile-tab-item" id="tab-gallery" onclick="app.switchTab('gallery')">المعرض</div>
                        <div class="tab-item profile-tab-item" id="tab-reviews" onclick="app.switchTab('reviews')">التقييمات</div>
                        ${(barber.paymentMethods && (barber.paymentMethods.cliq || barber.paymentMethods.visa || barber.paymentMethods.wallet)) ? `
                            <div class="tab-item profile-tab-item" id="tab-payment" onclick="app.switchTab('payment')">طرق الدفع</div>
                        ` : ''}
                    </div>

                    <div id="tab-content-store" class="products-grid profile-tab-content mb-5">
                        ${db.products.filter(p => p.barber_id === barberId).map(p => `
                            <div class="product-card">
                                <img src="${p.image}" alt="${p.name}">
                                <h4>${p.name}</h4>
                                <div class="price">JOD ${p.price}</div>
                                <button class="btn btn-outline btn-block text-white" style="border-color: #333; color: #fff !important;">إضافة</button>
                            </div>
                        `).join('')}
                    </div>
                    <div id="tab-content-gallery" class="products-grid profile-tab-content mb-5" style="display: none;">
                        <div class="product-card"><img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80" style="height: 150px;"></div>
                        <div class="product-card"><img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" style="height: 150px;"></div>
                    </div>
                    <div id="tab-content-reviews" class="profile-tab-content mb-5 text-right" style="display: none;">
                        <div class="pill-box">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <div style="font-weight: bold; font-size: 1.2rem; color: #fff;">4.9</div>
                                <div class="text-gold"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div>
                            </div>
                            <p class="text-muted m-0">بناءً على 120 تقييم</p>
                        </div>
                        <div class="pill-box text-center mt-3">
                            <h4 class="text-gold mb-3">أضف تقييمك للحلاق</h4>
                            <div class="rating-stars mb-4 text-gold" style="font-size: 1.8rem; cursor: pointer; display: flex; justify-content: center; gap: 5px; flex-direction: row-reverse;" id="barber-rating">
                                <i class="fa-regular fa-star" onclick="app.rateBarber(1, this)"></i>
                                <i class="fa-regular fa-star" onclick="app.rateBarber(2, this)"></i>
                                <i class="fa-regular fa-star" onclick="app.rateBarber(3, this)"></i>
                                <i class="fa-regular fa-star" onclick="app.rateBarber(4, this)"></i>
                                <i class="fa-regular fa-star" onclick="app.rateBarber(5, this)"></i>
                            </div>
                            <button class="btn btn-primary btn-block text-black" onclick="app.toggleSetting('إرسال التقييم', 'تم تسجيل تقييمك بنجاح!')">إرسال التقييم</button>
                        </div>
                    </div>
                    
                    ${(barber.paymentMethods && (barber.paymentMethods.cliq || barber.paymentMethods.visa || barber.paymentMethods.wallet)) ? `
                        <div id="tab-content-payment" class="profile-tab-content mb-5 text-right" style="display: none;">
                            <h4 class="text-gold mb-3"><i class="fa-solid fa-wallet"></i> خيارات الدفع المتاحة لدى الصالون</h4>
                            <p class="text-muted mb-4" style="font-size: 0.85rem; line-height: 1.5;">حجزك مؤكد تلقائياً لحفظ وقتك! الدفع متاح الآن إختيارياً إذا رغبت بالدفع المسبق لراحتك بدلاً من الدفع النقدي.</p>
                            ${barber.paymentMethods.cliq ? `
                                <div class="pill-box mb-3 d-flex justify-content-between align-items-center border-gold" style="background: rgba(212,175,55,0.05);">
                                    <div class="text-white"><i class="fa-solid fa-mobile-screen text-gold"></i> كليك (CliQ)</div>
                                    <div class="text-gold" style="font-family: monospace; font-size: 1.1rem; font-weight: bold;">${barber.paymentMethods.cliq}</div>
                                </div>
                            ` : ''}
                            ${barber.paymentMethods.wallet ? `
                                <div class="pill-box mb-3 d-flex justify-content-between align-items-center border-gold">
                                    <div class="text-white"><i class="fa-solid fa-money-bill-transfer text-gold"></i> محفظة إلكترونية</div>
                                    <div class="text-gold" style="font-family: monospace;">${barber.paymentMethods.wallet}</div>
                                </div>
                            ` : ''}
                            ${barber.paymentMethods.visa ? `
                                <div class="pill-box mb-3 d-flex justify-content-between align-items-center border-gold">
                                    <div class="text-white"><i class="fa-brands fa-cc-visa text-gold"></i> بطاقة ائتمان بالصالون</div>
                                    <div class="text-success" style="font-size: 0.85rem;"><i class="fa-solid fa-check"></i> متوفر في الصالون</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    </div>
                </div>
            </div>
            ${this.renderBottomNav('home')}
        `;
    },

    renderBookingFlow(barberId, serviceId) {
        const service = db.services.find(s => s.id === serviceId);
        return `
            ${this.renderTopHeader('حجز موعد')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                <div class="pill-box">
                    <h3 class="text-gold text-right mb-4">تفاصيل الحجز لـ ${service.name}</h3>
                    <div class="form-group text-right">
                        <label class="text-gold mb-2 d-block" style="font-size: 1.1rem; font-weight: bold;">الاسم الثنائي (مطلوب)</label>
                        <input type="text" id="customer-name" class="form-control" style="width: 100%; background: #111; border: 1px solid var(--gold-primary); color: #fff; padding: 15px; border-radius: var(--radius-sm); font-size: 1rem; text-align: right;" placeholder="الاسم الأول واسم العائلة ...">
                    </div>
                    <div class="form-group text-right mt-4">
                        <label class="text-gold mb-3 d-block" style="font-size: 1.1rem; font-weight: bold;">اختر الوقت المتاح (اليوم)</label>
                        <div class="schedule-grid">
                            ${(() => {
                const allSlots = ['10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص', '12:00 م', '12:30 م', '01:00 م', '01:30 م', '02:00 م', '02:30 م', '03:00 م', '03:30 م', '04:00 م', '04:30 م', '05:00 م', '05:30 م', '06:00 م', '06:30 م', '07:00 م', '07:30 م', '08:00 م', '08:30 م', '09:00 م', '09:30 م', '10:00 م'];
                const bookedVisualSlots = ['11:00 ص', '12:00 م', '03:30 م', '06:00 م', '07:30 م']; // Mocked visual slots for demonstration based on the user's audio
                return allSlots.map(time => {
                    if (bookedVisualSlots.includes(time)) {
                        return `<div class="time-slot disabled" style="background: rgba(231,76,60,0.1); border: 1px dashed #e74c3c; color: #e74c3c; opacity: 0.7;" title="الوقت محجوز" onclick="app.simulateNotificationError('هذا الوقت محجوز مسبقاً')">${time}</div>`;
                    } else {
                        return `<div class="time-slot" onclick="app.selectTime(this)">${time}</div>`;
                    }
                }).join('');
            })()}
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block mt-4" style="padding: 15px;" onclick="app.confirmBooking()">تأكيد الحجز (JOD ${service.price})</button>
                    <button class="btn btn-ghost btn-block mt-2" onclick="app.navigate('barberProfile', {id: ${barberId}})">إلغاء</button>
                </div>
            </div>
            ${this.renderBottomNav()}
        `;
    },

    renderAICamera() {
        return `
            ${this.renderTopHeader('مرآة الذكاء')}
            <style>
                .scan-line {
                    position: absolute;
                    width: 100%;
                    height: 3px;
                    background: var(--gold-primary);
                    box-shadow: 0 0 10px var(--gold-primary);
                    top: 0;
                    left: 0;
                    animation: scanning 2s infinite linear;
                    display: none;
                }
                @keyframes scanning {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                }
            </style>
            <div class="page container py-4 text-center">
                <p class="text-gold mb-3" style="font-size: 0.9rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> دع الذكاء الاصطناعي يقترح القصة الأنسب لملامحك</p>
                <div class="camera-container border-gold" style="position: relative; overflow: hidden; border-radius: 12px; margin: 0 auto; max-width: 300px; height: 350px;">
                    <video id="ai-camera-feed" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; background: #111;"></video>
                    <img id="ai-mock-result" style="display: none; width: 100%; height: 100%; object-fit: cover;">
                    <div id="ai-scan-line" class="scan-line"></div>
                </div>
                
                <div id="ai-results-actions" style="display: none;" class="mt-4">
                    <h4 class="text-success mb-3" style="font-size: 1rem;"><i class="fa-solid fa-check-circle"></i> تم العثور على القصة المثالية!</h4>
                    <button class="btn btn-outline mb-2 w-100" onclick="window.notifier.show('تم التحميل', 'تم حفظ الصورة في الاستوديو بنجاح لتعرضها للحلاق.', 'success')">
                        <i class="fa-solid fa-download"></i> تحميل الصورة لجهازي
                    </button>
                    <button class="btn btn-primary w-100" onclick="app.navigate('clientHome')">ابحث عن حلاق لتنفيذها</button>
                </div>

                <div id="ai-scan-btn-container" class="mt-4">
                    <button class="btn btn-primary w-100 mb-2" onclick="app.startAIScanning(this)">
                        <i class="fa-solid fa-camera"></i> تحليل وجهي الآن
                    </button>
                    <button class="btn btn-ghost w-100" onclick="app.navigate('clientHome')">العودة للرئيسية</button>
                </div>
            </div>
            ${this.renderBottomNav()}
        `;
    },

    renderClientSettings() {
        return `
            ${this.renderTopHeader('الإعدادات')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                <div class="pill-box text-right">
                    <h3 class="text-gold mb-4"><i class="fa-solid fa-user-gear"></i> إعدادات حسابك</h3>
                    
                    <div class="setting-item mb-4 pb-3" style="border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="m-0 text-white">اللغة (Language)</h4>
                            <button class="btn btn-outline" style="padding: 5px 15px;" onclick="app.toggleLanguage()"><i class="fa-solid fa-globe"></i> تغيير</button>
                        </div>
                        <p class="text-muted m-0" style="font-size: 0.85rem;">التطبيق يدعم العربية والإنجليزية فقط</p>
                    </div>

                    <div class="setting-item mb-4 pb-3" style="border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="m-0 text-white">موقعي الجغرافي</h4>
                            <button class="btn btn-outline text-info" style="border-color: #3498db; color: #3498db; padding: 5px 15px;" onclick="app.requestLocation()"><i class="fa-solid fa-location-dot"></i> تحديث</button>
                        </div>
                        <p class="text-muted m-0" style="font-size: 0.85rem;">يُستخدم لعرض أقرب صالونات الحلاقة إليك</p>
                    </div>

                    <div class="setting-item mb-4 pb-3" style="border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="m-0 text-white">الإشعارات</h4>
                            <button class="btn btn-primary" style="padding: 5px 15px;" onclick="app.toggleSetting('الإشعارات')">مفعل</button>
                        </div>
                        <p class="text-muted m-0" style="font-size: 0.85rem;">استلام تنبيهات قبل الموعد بـ 30 دقيقة</p>
                    </div>
                </div>
            </div>
            ${this.renderBottomNav('settings')}
        `;
    },

    renderWelcome() {
        return `
            <div class="welcome-container page text-center container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh;">
                <i class="fa-solid fa-scissors mb-4" style="font-size: 5rem; color: var(--gold-primary);"></i>
                <h1 class="text-gold mb-5" style="font-size: 3rem;">BarberGo</h1>
                
                <div class="pill-box w-100 mb-2 cursor-pointer" onclick="app.navigate('clientHome')" style="border-color: var(--gold-primary);">
                    <h2 class="text-white">دخول كـ عميل</h2>
                </div>
                <div class="pill-box w-100 mb-4 cursor-pointer" onclick="app.navigate('barberLogin')">
                    <h2 class="text-white">دخول كـ حلاق</h2>
                </div>
                <div class="text-muted mt-4 cursor-pointer" onclick="app.navigate('adminLogin')">دخول المدير</div>
            </div>
        `;
    },

    // ==========================================
    // 2. Barber Dashboard Features
    // ==========================================
    renderBarberLogin() {
        return `
            ${this.renderTopHeader('بوابة الحلاقين')}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4"><i class="fa-solid fa-store"></i></div>
                    <h2 class="text-gold mb-4">الدخول لصالونك</h2>
                    <div class="form-group">
                        <input type="password" id="barber-code" class="form-control text-center" style="-webkit-text-security: disc;" placeholder="رمز الدخول">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyBarber()">متابعة</button>
                </div>
                <button class="btn btn-ghost w-100" onclick="app.navigate('welcome')">العودة للرئيسية</button>
            </div>
        `;
    },

    renderBarberEmailSetup() {
        return `
            ${this.renderTopHeader('بوابة الحلاقين')}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4" style="border-color: #e74c3c; color: #e74c3c;"><i class="fa-brands fa-google"></i></div>
                    <h2 class="text-gold mb-3">ربط البريد الإلكتروني</h2>
                    <p class="text-muted mb-4" style="font-size: 0.85rem;">لأغراض الأمان والحجوزات، يرجى إدخال حساب الـ Gmail الخاص بك للمتابعة</p>
                    <div class="form-group mb-4">
                        <input type="email" id="barber-email" class="form-control text-left" dir="ltr" placeholder="example@gmail.com">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyBarberEmail()">دخول للوحة التحكم</button>
                    <div class="text-muted mb-3" style="font-size: 0.8rem;">أو الدخول مباشرة بـ:</div>
                    <button class="btn btn-ghost btn-block" style="border: 1px solid #333;" onclick="app.verifyBarberEmail()">
                        <i class="fa-brands fa-google text-danger"></i> Google Login
                    </button>
                </div>
            </div>
        `;
    },

    renderBarberDashboard(barberId) {
        const barber = db.barbers.find(b => b.id === barberId);
        return `
            ${this.renderTopHeader('لوحة تحكم: ' + barber.name)}
            <div class="page container py-3" style="padding-bottom: 100px;">
                
                ${barber.subscriptionStatus === 'trial' ? `
                    <div class="pill-box mb-4 text-right" style="border-right: 4px solid #e74c3c; background: rgba(231,76,60,0.1);">
                        <h4 class="text-danger mb-2"><i class="fa-solid fa-triangle-exclamation"></i> تنبيه: اشتراكك ينتهي قريباً</h4>
                        <p class="text-white mb-3" style="font-size: 0.85rem; line-height: 1.6;">سينتهي الاشتراك التجريبي (30 يوم). نرجو التجديد لضمان استمرار ظهور صالونك للعملاء، لا تفوت زبائنك!</p>
                        <button class="btn btn-outline text-danger w-100" style="border-color: #e74c3c;" onclick="app.showAdminPayoutDetails()">إظهار بيانات دفع المنصة للإشتراك</button>
                    </div>
                ` : ''}

                <!-- Barber Navigation Tabs -->
                <div class="tabs-container" style="overflow-x: auto; white-space: nowrap; gap: 15px; border-bottom: none; margin-bottom: 25px; padding-bottom: 10px;">
                    <button class="btn btn-ghost bdash-tab-item active" id="bdash-tab-1" onclick="app.switchBarberDashboardTab(1)">إحصائيات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-2" onclick="app.switchBarberDashboardTab(2)">ملفي</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-3" onclick="app.switchBarberDashboardTab(3)">الخدمات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-4" onclick="app.switchBarberDashboardTab(4)">التقويم</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-5" onclick="app.switchBarberDashboardTab(5)">المتجر</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-7" onclick="app.switchBarberDashboardTab(7)">معرض الصور</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-8" onclick="app.switchBarberDashboardTab(8)">التقييمات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-6" onclick="app.switchBarberDashboardTab(6)">المتقدمة</button>
                </div>

                <!-- Page 1: Analytics -->
                <div id="bdash-content-1" class="bdash-content">
                    <h3 class="text-gold text-right mb-3"><i class="fa-solid fa-chart-line"></i> إحصائيات متقدمة</h3>
                    <div class="products-grid mb-4" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                        
                        <!-- Stat 1 -->
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-sack-dollar text-gold"></i> صافي الأرباح <span style="font-size: 0.6rem">(JOD)</span></div>
                            <div class="d-flex justify-content-between mt-2 text-center" style="gap: 5px;">
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">يومي</div><div class="text-white" style="font-size: 0.9rem; font-weight: bold;">85</div></div>
                                <div style="width: 1px; background: #333;"></div>
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">أسبوعي</div><div class="text-white" style="font-size: 0.9rem; font-weight: bold;">450</div></div>
                                <div style="width: 1px; background: #333;"></div>
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">شهري</div><div class="text-gold" style="font-size: 0.9rem; font-weight: bold;">1.8k</div></div>
                            </div>
                        </div>
                        
                        <!-- Stat 2 -->
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-users text-info"></i> معدل ولاء الزبائن</div>
                            <h4 class="text-white m-0" style="font-size: 1.5rem;">68% <span style="font-size: 0.8rem; color: #2ecc71;"><i class="fa-solid fa-arrow-trend-up"></i></span></h4>
                        </div>

                        <!-- Stat 3 -->
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-fire text-danger"></i> الخدمة الأكثر طلباً</div>
                            <h4 class="text-gold m-0" style="font-size: 1.1rem; padding-top: 5px;">قص شعر ولحية</h4>
                        </div>
                        
                        <!-- Stat 4 -->
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-triangle-exclamation text-warning"></i> معدل الإلغاء</div>
                            <h4 class="text-white m-0" style="font-size: 1.5rem;">4% <span style="font-size: 0.8rem; color: #e74c3c;"><i class="fa-solid fa-arrow-trend-down"></i></span></h4>
                        </div>
                    </div>

                    <h3 class="text-gold text-right mb-3"><i class="fa-solid fa-chart-column"></i> تدرج الحجوزات (أسبوعي)</h3>
                    <div class="pill-box m-0 p-4">
                        <div class="css-bar-chart d-flex align-items-end justify-content-between" style="height: 150px; border-bottom: 2px solid #333; padding-bottom: 10px; gap: 8px;">
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-gradient); width: 100%; height: 40%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">السبت</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-primary); width: 100%; height: 60%; border-radius: 4px 4px 0 0; opacity: 0.7;"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">الأحد</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-gradient); width: 100%; height: 80%; border-radius: 4px 4px 0 0; box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">الاثنين</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-primary); width: 100%; height: 30%; border-radius: 4px 4px 0 0; opacity: 0.5;"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">الثلاثاء</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-gradient); width: 100%; height: 90%; border-radius: 4px 4px 0 0; box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">الأربعاء</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-primary); width: 100%; height: 50%; border-radius: 4px 4px 0 0; opacity: 0.6;"></div>
                                <span class="text-muted mt-2" style="font-size: 0.7rem;">الخميس</span>
                            </div>
                            <div class="bar-col text-center d-flex flex-column" style="height: 100%; justify-content: flex-end; flex: 1;">
                                <div style="background: var(--gold-gradient); width: 100%; height: 100%; border-radius: 4px 4px 0 0; box-shadow: 0 0 15px rgba(212, 175, 55, 0.6);"></div>
                                <span class="text-gold mt-2" style="font-size: 0.7rem; font-weight: bold;">الجمعة</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Page 2: Profile -->
                <div id="bdash-content-2" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right">
                        <h4 class="text-gold mb-4"><i class="fa-solid fa-address-card"></i> إعدادات الملف الشخصي</h4>
                        
                        <div class="form-group mb-4 text-center">
                            <label class="text-gold mb-2 d-block text-right" style="font-weight: bold;"><i class="fa-solid fa-image"></i> صورة الغلاف للصالون (Cover Image)</label>
                            <input type="file" id="barber-cover-upload" accept="image/*" style="display: none;" onchange="app.handleImageUpload(event, 'cover')">
                            <div style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05); padding: 25px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.3s;" onclick="document.getElementById('barber-cover-upload').click()">
                                <i class="fa-solid fa-cloud-arrow-up mb-2" style="font-size: 2.5rem; color: var(--gold-primary);"></i>
                                <div class="text-white" style="font-weight: bold;">اضغط هنا لرفع صورة غلاف من الجهاز</div>
                                <div class="text-muted mt-1" id="cover-upload-status" style="font-size: 0.8rem;">سواء كنت تستخدم الهاتف أو الكمبيوتر</div>
                            </div>
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-store"></i> اسم الصالون (Shop Name)</label>
                            <input type="text" id="barber-edit-name" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.name || ''}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-pen-nib"></i> السيرة الذاتية (Bio)</label>
                            <textarea id="barber-edit-bio" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--gold-primary); color: #fff; padding: 15px; border-radius: var(--radius-sm); font-size: 0.95rem; text-align: right; resize: vertical; line-height: 1.6; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);" rows="3" placeholder="اكتب نبذة عنك وعن خبراتك لكي يراها عملاؤك...">${barber.bio || ''}</textarea>
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-mobile-screen"></i> رقم الهاتف الرئيسي</label>
                            <input type="text" id="barber-edit-phone" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.phone || ''}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-location-dot" style="color: #3498db;"></i> الموقع الجغرافي (العنوان الكامل)</label>
                            <input type="text" id="barber-edit-location" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.location || ''}">
                        </div>

                        <div class="pill-box mb-4" style="background: rgba(231,76,60,0.05); border: 1px solid rgba(231,76,60,0.3);">
                            <h4 class="text-gold mb-3"><i class="fa-solid fa-bolt"></i> خيارات الخدمات الخاصة</h4>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div class="text-white" style="font-weight: bold;">تفعيل زر اتصال الطوارئ</div>
                                    <div class="text-muted" style="font-size: 0.8rem;">يتيح للعملاء الاتصال بك خارج المواعيد</div>
                                </div>
                                <button id="btn-toggle-emergency" class="btn ${barber.settings && barber.settings.enableEmergency ? 'btn-success' : 'btn-ghost text-muted'}" style="border: 1px solid var(--border-color);" onclick="app.toggleBarberSettingParam(this, 'enableEmergency')">
                                    ${barber.settings && barber.settings.enableEmergency ? '<i class="fa-solid fa-toggle-on"></i> مفعل' : '<i class="fa-solid fa-toggle-off"></i> معطل'}
                                </button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
                                <div>
                                    <div class="text-white" style="font-weight: bold;">خدمة الحلاقة المنزلية (Home Service)</div>
                                    <div class="text-muted" style="font-size: 0.8rem;">إظهار شارة الحلاقة المنزلية للعملاء</div>
                                </div>
                                <button id="btn-toggle-home" class="btn ${barber.homeService ? 'btn-primary' : 'btn-ghost text-muted'}" style="border: 1px solid var(--border-color);" onclick="app.toggleBarberSettingParam(this, 'homeService')">
                                    ${barber.homeService ? '<i class="fa-solid fa-toggle-on"></i> متاح' : '<i class="fa-solid fa-toggle-off"></i> غير متاح'}
                                </button>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-block mt-3" style="padding: 15px; font-size: 1.1rem;" onclick="app.saveBarberSettings()">حفظ التعديلات الفعلية</button>
                    </div>
                </div>

                <!-- Page 3: Services -->
                <div id="bdash-content-3" class="bdash-content" style="display: none;">
                    <div class="pill-box p-3 mb-4 text-center cursor-pointer" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="app.simulateAddService()">
                        <h4 class="text-gold m-0"><i class="fa-solid fa-plus"></i> إضافة خدمة يدوية جديدة</h4>
                        <div class="text-muted mt-1" style="font-size: 0.85rem;">أضف اسم الخدمة، السعر، والوقت المستغرق</div>
                    </div>
                    <div id="services-list-container">
                    ${db.services.filter(s => s.barber_id === barberId).map(s => `
                        <div class="pill-box p-3 mb-2 d-flex justify-content-between align-items-center" style="border-left: 3px solid var(--gold-primary);">
                            <div class="text-right">
                                <h4 class="m-0 text-white">${s.name}</h4>
                                <div class="text-muted" style="font-size: 0.85rem; margin-top: 5px;"><i class="fa-regular fa-clock"></i> ${s.duration} دقيقة | <i class="fa-solid fa-tag"></i> JOD ${s.price}</div>
                            </div>
                            <button class="btn btn-ghost text-danger p-2" onclick="app.toggleSetting('حذف الخدمة')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `).join('')}
                    </div>
                </div>

                <!-- Page 4: Calendar -->
                <div id="bdash-content-4" class="bdash-content" style="display: none;">
                    
                    <!-- Working Hours Settings -->
                    <div class="pill-box text-right mb-4 border-gold">
                        <h4 class="text-gold mb-3"><i class="fa-regular fa-clock"></i> إعدادات أوقات الدوام</h4>
                        <div class="d-flex" style="gap: 10px; margin-bottom: 15px;">
                            <div class="form-group flex-fill">
                                <label class="text-white mb-2 d-block" style="font-size: 0.85rem;">من الساعة</label>
                                <input type="time" class="form-control text-center" value="10:00" style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--gold-primary); padding: 10px;">
                            </div>
                            <div class="form-group flex-fill">
                                <label class="text-white mb-2 d-block" style="font-size: 0.85rem;">إلى الساعة</label>
                                <input type="time" class="form-control text-center" value="22:00" style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--gold-primary); padding: 10px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="text-white mb-2 d-block" style="font-size: 0.85rem;">مدة الجلسة (وقت الموعد التلقائي)</label>
                            <select class="form-control text-right" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 10px;">
                                <option>15 دقيقة</option>
                                <option>30 دقيقة</option>
                                <option>45 دقيقة</option>
                                <option selected>60 دقيقة</option>
                            </select>
                        </div>
                        <button class="btn btn-primary w-100 mt-3" style="padding: 12px; font-size: 1rem;" onclick="app.toggleSetting('حفظ أوقات العمل')">حفظ الأوقات المدخلة</button>
                    </div>

                    <!-- Existing Bookings -->
                    <div class="pill-box text-right mb-4">
                        <h4 class="text-white mb-3" style="font-size: 1.1rem;"><i class="fa-solid fa-calendar-check text-success"></i> الحجوزات القادمة</h4>
                        
                        <div class="booking-item mb-3 p-3" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); border-right: 3px solid #2ecc71;">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="text-gold" style="font-size: 1.1rem; font-weight: bold;">أحمد محمد</div>
                                <div class="text-muted" style="font-size: 0.85rem;"><i class="fa-regular fa-clock"></i> اليوم, 04:30 م</div>
                            </div>
                            <div class="text-white mb-3" style="font-size: 0.9rem;"><i class="fa-solid fa-scissors text-muted"></i> قصة شعر مودرن مع سشوار</div>
                            <button class="btn w-100 mt-2 text-danger" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); font-weight: bold; padding: 10px;" onclick="app.cancelBookingAlert(this)">إلغاء الحجز وإرسال تنبيه للعميل</button>
                        </div>
                        
                        <div class="booking-item p-3" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); border-right: 3px solid #2ecc71;">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="text-gold" style="font-size: 1.1rem; font-weight: bold;">خالد عبد الله</div>
                                <div class="text-muted" style="font-size: 0.85rem;"><i class="fa-regular fa-clock"></i> اليوم, 06:00 م</div>
                            </div>
                            <div class="text-white mb-3" style="font-size: 0.9rem;"><i class="fa-solid fa-scissors text-muted"></i> تنظيف بشرة كامل</div>
                            <button class="btn w-100 mt-2 text-danger" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); font-weight: bold; padding: 10px;" onclick="app.cancelBookingAlert(this)">إلغاء الحجز وإرسال تنبيه للعميل</button>
                        </div>
                    </div>

                    <!-- Block Out Settings -->
                    <div class="pill-box text-right">
                        <h4 class="text-danger mb-3" style="font-size: 1.1rem;"><i class="fa-solid fa-ban"></i> قفل أوقات (طوارئ / استراحة)</h4>
                        <p class="text-muted mb-3" style="font-size: 0.85rem; line-height: 1.5;">اضغط على أي وقت لتقوم بإغلاقه حتى وإن لم يكن هناك حجز مسبق، وسيظهر للعملاء كـ "غير متاح".</p>
                        <div class="schedule-grid" style="grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            ${(() => {
                const allSlots = ['10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص', '12:00 م', '12:30 م', '01:00 م', '01:30 م', '02:00 م', '02:30 م', '03:00 م', '03:30 م', '04:00 م', '04:30 م', '05:00 م', '05:30 م', '06:00 م', '06:30 م', '07:00 م', '07:30 م', '08:00 م', '08:30 م', '09:00 م', '09:30 م', '10:00 م'];
                const bookedVisualSlots = ['11:00 ص', '12:00 م', '03:30 م', '06:00 م', '07:30 م'];
                return allSlots.map(time => {
                    if (bookedVisualSlots.includes(time)) {
                        return `<div class="time-slot disabled" style="background: rgba(231,76,60,0.2); border: 1px dashed #e74c3c; color: #e74c3c; opacity: 1;" onclick="app.simulateNotificationError('حاول إلغاء الحجز من القائمة أولاً')">${time} (محجوز)</div>`;
                    } else {
                        return `<div class="time-slot" onclick="app.toggleBlockTime(this)">${time}</div>`;
                    }
                }).join('');
            })()}
                        </div>
                    </div>
                </div>

                <!-- Page 5: Store -->
                <div id="bdash-content-5" class="bdash-content" style="display: none;">
                     <input type="file" id="product-image-upload" accept="image/*" style="display: none;" onchange="app.handleProductImageUpload(event)">
                     <div class="pill-box p-3 mb-4 text-center cursor-pointer" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="app.addProduct()">
                         <h4 class="text-gold m-0"><i class="fa-solid fa-box-open"></i> إضافة منتج جديد للمتجر</h4>
                         <div class="text-muted mt-1" style="font-size: 0.85rem;">أضف صورة واسم المنتج مع السعر لبيعه لعملائك</div>
                     </div>
                     
                     <div class="products-grid" id="store-products-list" style="grid-template-columns: 1fr 1fr; gap: 15px;">
                         <div class="pill-box p-2 text-center" style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                             <img src="https://images.unsplash.com/photo-1599305090598-fe179d501227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                             <h4 class="text-white m-0" style="font-size: 0.95rem;">شامبو اللحية الفاخر</h4>
                             <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">12 JOD</div>
                         </div>
                         <div class="pill-box p-2 text-center" style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                             <img src="https://images.unsplash.com/photo-1621607512214-68297480165e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                             <h4 class="text-white m-0" style="font-size: 0.95rem;">جل العناية بالشعر</h4>
                             <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">8 JOD</div>
                         </div>
                     </div>
                </div>

                <!-- Page 7: Gallery -->
                <div id="bdash-content-7" class="bdash-content" style="display: none;">
                    <input type="file" id="gallery-image-upload" accept="image/*" style="display: none;" onchange="app.handleImageUpload(event, 'gallery')">
                    <div class="pill-box p-3 mb-4 text-center cursor-pointer" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="document.getElementById('gallery-image-upload').click()">
                         <h4 class="text-gold m-0"><i class="fa-solid fa-images"></i> رفع صورة جديدة لمعرض الأعمال</h4>
                         <div class="text-muted mt-1" style="font-size: 0.85rem;">الصور تجذب العملاء الجدد بنسبة 70% أكثر</div>
                     </div>
                     <div class="products-grid" id="gallery-images-list" style="grid-template-columns: repeat(3, 1fr); gap: 10px;">
                         <div style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                             <img src="https://images.unsplash.com/photo-1593980634289-cb4eb5f7a0b3?w=400&q=80" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                         </div>
                         <div style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                             <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                         </div>
                         <div style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
                             <img src="https://images.unsplash.com/photo-1512496015851-a1fbbfc61a4b?w=400&q=80" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                         </div>
                     </div>
                </div>

                <!-- Page 8: Customer Reviews -->
                <div id="bdash-content-8" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right mb-4 border-gold">
                        <h4 class="text-gold mb-2" style="font-size: 2.5rem; text-align: center;"><i class="fa-solid fa-star"></i> 4.8</h4>
                        <div class="text-white text-center mb-4">تقييمك العام من 120 عميل</div>
                        
                        <div class="review-item mb-3 p-3" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-main);">
                            <div class="d-flex justify-content-between mb-2">
                                <div class="text-white font-weight-bold">طارق أحمد</div>
                                <div class="text-gold"><i class="fa-solid fa-star"></i> 5.0</div>
                            </div>
                            <div class="text-muted" style="font-size: 0.85rem; line-height: 1.5;">حلاقة ممتازة جداً ونظافة في المكان، تعامل راقي. أنصح به بشدة.</div>
                            <div class="text-left mt-2"><span style="font-size: 0.75rem; color: var(--gold-primary);">منذ يومين</span></div>
                        </div>

                        <div class="review-item mb-3 p-3" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-main);">
                            <div class="d-flex justify-content-between mb-2">
                                <div class="text-white font-weight-bold">عمر فاروق</div>
                                <div class="text-gold"><i class="fa-solid fa-star"></i> 4.0</div>
                            </div>
                            <div class="text-muted" style="font-size: 0.85rem; line-height: 1.5;">شغل نظيف بس تأخر 5 دقايق عن الموعد. بشكل عام تجربة جيدة.</div>
                            <div class="text-left mt-2"><span style="font-size: 0.75rem; color: var(--gold-primary);">منذ أسبوع</span></div>
                        </div>
                    </div>
                </div>

                <!-- Page 6: Advanced -->
                <div id="bdash-content-6" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right">
                        <h4 class="text-gold mb-4">الخيارات المتقدمة</h4>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 class="m-0 text-white">خدمة المنازل (House Calls)</h4>
                                <p class="text-muted m-0" style="font-size: 0.8rem;">السماح للعملاء بطلب قدومك لمنازلهم</p>
                            </div>
                            <button class="btn ${barber.settings.enableHomeService ? 'btn-primary' : 'btn-ghost'}" onclick="app.toggleSetting('خدمة المنازل')">${barber.settings.enableHomeService ? 'مفعل' : 'معطل'}</button>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="m-0 text-danger">حجوزات الطوارئ 🚨</h4>
                                <p class="text-muted m-0" style="font-size: 0.8rem;">السماح بتخطي وقت الانتظار بأسعار مضاعفة</p>
                            </div>
                            <button class="btn ${barber.settings.enableEmergency ? 'btn-primary text-white' : 'btn-ghost'}" style="${barber.settings.enableEmergency ? 'background: #e74c3c;' : ''}" onclick="app.toggleSetting('حجوزات الطوارئ')">${barber.settings.enableEmergency ? 'مفعل' : 'معطل'}</button>
                        </div>
                    </div>

                    <div class="pill-box text-right mt-4 border-gold">
                        <h4 class="text-gold mb-3"><i class="fa-solid fa-wallet"></i> إعدادات الدفع للعملاء (Payment)</h4>
                        <p class="text-muted mb-4" style="font-size: 0.85rem; line-height: 1.5;">قم بإضافة تفاصيل وسائل الدفع الخاصة بك ليتمكن العملاء من الدفع مسبقاً إذا رغبوا. الحجز يبقى مستقلاً وتأكيده لا يتطلب الدفع.</p>
                        
                        <div class="form-group mb-4">
                            <label class="text-white mb-2 d-flex justify-content-between"><span>معرف كليك (CliQ Alias)</span> <span class="text-success" style="font-size: 0.8rem;">${(barber.paymentMethods && barber.paymentMethods.cliq) ? 'مفعل' : 'معطل'}</span></label>
                            <input type="text" class="form-control text-left" dir="ltr" placeholder="مثال: AHMAD199" style="background: var(--bg-main); border-color: var(--border-color); color: #fff;" value="${(barber.paymentMethods && barber.paymentMethods.cliq) || ''}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-white mb-2 d-flex justify-content-between"><span>رقم المحفظة (Wallet)</span> <span class="text-success" style="font-size: 0.8rem;">${(barber.paymentMethods && barber.paymentMethods.wallet) ? 'مفعل' : 'معطل'}</span></label>
                            <input type="text" class="form-control text-left" dir="ltr" placeholder="07XXXXXXXX" style="background: var(--bg-main); border-color: var(--border-color); color: #fff;" value="${(barber.paymentMethods && barber.paymentMethods.wallet) || ''}">
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 class="m-0 text-white"><i class="fa-brands fa-cc-visa text-gold"></i> الدفع بالبطاقة بالصالون</h4>
                            </div>
                            <button class="btn btn-outline" style="border-color: var(--gold-primary);" onclick="app.toggleSetting('الدفع بالبطاقة')">${(barber.paymentMethods && barber.paymentMethods.visa) ? 'مفعل' : 'معطل'}</button>
                        </div>

                        <button class="btn btn-primary w-100" onclick="window.notifier.show('تم الحفظ', 'تم تحديث خيارات الدفع بنجاح!', 'success')">حفظ وسائل الدفع</button>
                    </div>
                </div>

            </div>
            
            <div class="bottom-nav-container">
                <div class="bottom-nav">
                    <div class="nav-item cursor-pointer" onclick="app.navigate('welcome')">
                        <i class="fa-solid fa-right-from-bracket text-danger"></i><span class="text-danger">تسجيل خروج</span>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 3. Admin Dashboard
    // ==========================================
    renderAdminLogin() {
        return `
            ${this.renderTopHeader('لوحة المدير')}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4"><i class="fa-solid fa-shield-halved"></i></div>
                    <h2 class="text-gold mb-4">بوابة الإدارة</h2>
                    <div class="form-group">
                        <input type="password" id="admin-password" class="form-control text-center" style="-webkit-text-security: disc;" placeholder="كلمة المرور">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyAdmin()">متابعة</button>
                </div>
                <button class="btn btn-ghost w-100" onclick="app.navigate('welcome')">العودة للرئيسية</button>
            </div>
        `;
    },

    renderAdminEmailSetup() {
        return `
            ${this.renderTopHeader('لوحة المدير')}
            <div class="page container py-5" style="max-width: 400px;">
                <div class="pill-box text-center">
                    <div class="ai-icon mb-4" style="border-color: #e74c3c; color: #e74c3c;"><i class="fa-brands fa-google"></i></div>
                    <h2 class="text-gold mb-3">ربط البريد الإلكتروني للمدير</h2>
                    <p class="text-muted mb-4" style="font-size: 0.85rem;">يرجى تأكيد حساب الـ Gmail الخاص بك كبوابة تسجيل آمنة</p>
                    <div class="form-group mb-4">
                        <input type="email" id="admin-email" class="form-control text-left" dir="ltr" placeholder="admin@gmail.com">
                    </div>
                    <button class="btn btn-primary btn-block mb-3" onclick="app.verifyAdminEmail()">دخول للوحة التحكم</button>
                    <div class="text-muted mb-3" style="font-size: 0.8rem;">أو الدخول مباشرة بـ:</div>
                    <button class="btn btn-ghost btn-block" style="border: 1px solid #333;" onclick="app.verifyAdminEmail()">
                        <i class="fa-brands fa-google text-danger"></i> Google Login
                    </button>
                </div>
            </div>
        `;
    },

    renderAdminDashboard() {
        const barbers = db.barbers;
        const totalClients = db.users.filter(u => u.type === 'client').length;
        const adminData = db.adminSettings;

        const barbersRows = barbers.map(b => {
            let subBadge = b.subscriptionStatus === 'active' ? '<span class="text-success p-1" style="background: rgba(46, 204, 113, 0.1); border-radius: 5px; font-size: 0.8rem;">نشط</span>' :
                b.subscriptionStatus === 'blocked' ? '<span class="text-danger p-1" style="background: rgba(231, 76, 60, 0.1); border-radius: 5px; font-size: 0.8rem;">محظور</span>' :
                    '<span class="text-warning p-1" style="background: rgba(243, 156, 18, 0.1); border-radius: 5px; font-size: 0.8rem;">تجريبي</span>';

            const isBlocked = b.subscriptionStatus === 'blocked';
            const actionBtn = `<button class="btn ${isBlocked ? 'btn-danger' : 'btn-primary'} text-white p-1 ml-2" style="font-size: 0.75rem; width: 80px;" onclick="app.toggleBarberStatus(${b.id}, this)">
                ${isBlocked ? '<i class="fa-solid fa-lock"></i> محظور' : '<i class="fa-solid fa-lock-open"></i> تفعيل'}
            </button>`;

            const alertBtn = `<button class="btn text-warning p-1" style="font-size: 1rem;" onclick="app.sendSubscriptionAlert('${b.name}')"><i class="fa-solid fa-bell"></i></button>`;

            const deleteBtn = `<button class="btn text-danger p-1 border border-danger mx-1" style="font-size: 1rem; border-radius: 5px; background: rgba(231,76,60,0.1);" onclick="app.deleteBarber(${b.id})" title="حذف نهائي"><i class="fa-solid fa-trash-can"></i></button>`;

            return `
                <div class="pill-box p-3 mb-3 d-flex justify-content-between align-items-center" style="border-right: 3px solid ${isBlocked ? '#e74c3c' : 'var(--gold-primary)'};">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${b.image}" width="45" height="45" style="border-radius: 50%; border: 1px solid var(--border-color); object-fit: cover;">
                        <div class="text-right">
                            <div style="font-weight: bold; color: #fff; font-size: 0.95rem;">${b.name}</div>
                            <div class="mt-1">${subBadge} <span class="text-muted" style="font-size: 0.75rem;"><i class="fa-solid fa-phone"></i> ${b.phone}</span></div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        ${deleteBtn}
                        ${alertBtn}
                        ${actionBtn}
                    </div>
                </div>
            `;
        }).join('');

        const supportRows = db.supportTickets.map(t => `
            <div class="pill-box p-3 mb-2 text-right border-${t.status === 'open' ? 'warning' : 'success'}">
                <div class="d-flex justify-content-between mb-2">
                    <span class="badge ${t.status === 'open' ? 'badge-gold' : 'text-success'}">${t.status}</span>
                    <strong class="text-white">${t.sender} (${t.type})</strong>
                </div>
                <p class="text-muted m-0" style="font-size: 0.9rem;">${t.message}</p>
                ${t.status === 'open' ? `<button class="btn btn-ghost text-gold p-0 mt-2" onclick="app.toggleSetting('حل التذكرة')">تحديد كمحلولة <i class="fa-solid fa-check"></i></button>` : ''}
            </div>
        `).join('');

        return `
            ${this.renderTopHeader('المدير العام')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                
                <!-- Admin Tabs -->
                <div class="tabs-container mb-4" style="overflow-x: auto; white-space: nowrap; gap: 10px; border-bottom: none; padding-bottom: 10px;">
                    <button class="btn btn-ghost admin-tab-item active" id="admin-tab-1" onclick="app.switchAdminTab(1)"><i class="fa-solid fa-chart-pie"></i> نظرة عامة</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-2" onclick="app.switchAdminTab(2)"><i class="fa-solid fa-money-bill-wave"></i> تحصيل الأرباح</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-3" onclick="app.switchAdminTab(3)"><i class="fa-solid fa-tags"></i> الاشتراكات</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-4" onclick="app.switchAdminTab(4)"><i class="fa-solid fa-users-gear"></i> الصالونات</button>
                </div>

                <!-- Tab 1: Global Analytics -->
                <div id="admin-content-1" class="admin-content">
                    <h3 class="text-gold text-right mb-3">حالة المنصة</h3>
                    <div class="products-grid mb-4" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="pill-box text-center p-3 m-0" style="background: rgba(212, 175, 55, 0.05); border-color: var(--gold-primary);">
                            <i class="fa-solid fa-wallet text-gold mb-2" style="font-size: 1.8rem;"></i>
                            <h3 class="text-white mb-1" style="font-weight: bold;">${adminData.platformRevenue} JOD</h3>
                            <div class="text-muted" style="font-size: 0.8rem;">إجمالي الإيرادات (30 يوم)</div>
                        </div>
                        <div class="pill-box text-center p-3 m-0">
                            <i class="fa-solid fa-shop text-gold mb-2" style="font-size: 1.8rem;"></i>
                            <h3 class="text-white mb-1" style="font-weight: bold;">${barbers.length}</h3>
                            <div class="text-muted" style="font-size: 0.8rem;">الصالونات المسجلة</div>
                        </div>
                    </div>

                    <div class="pill-box mb-4 text-right">
                        <h4 class="text-white mb-3"><i class="fa-solid fa-arrow-trend-up text-gold"></i> نمو الاشتراكات الشهرية</h4>
                        <canvas id="growthChart" height="180"></canvas>
                    </div>

                    <h3 class="text-gold text-right mb-3">تذاكر الدعم الفني</h3>
                    <div class="mb-4">${supportRows}</div>
                </div>

                <!-- Tab 2: Director's Payout -->
                <div id="admin-content-2" class="admin-content" style="display: none;">
                    <div class="pill-box text-right border-gold">
                        <h3 class="text-gold mb-3"><i class="fa-solid fa-building-columns"></i> إعدادات تحصيل الأرباح</h3>
                        <p class="text-muted mb-4" style="font-size: 0.85rem; line-height: 1.6;">جميع مدفوعات اشتراكات الحلاقين سيتم تحويلها بناءً على المعلومات التالية. يرجى الدقة في إدخالها.</p>
                        
                        <div class="form-group mb-4 border-bottom pb-3" style="border-color: #333 !important;">
                            <label class="text-white mb-2 d-block" style="font-size: 0.9rem;"><i class="fa-solid fa-mobile-screen text-gold"></i> حساب كليك (CliQ Alias)</label>
                            <input type="text" id="admin-cliq" class="form-control text-left" dir="ltr" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 12px; font-family: monospace;" value="${adminData.payoutDetails.cliq || ''}">
                        </div>

                        <div class="form-group mb-4 border-bottom pb-3" style="border-color: #333 !important;">
                            <label class="text-white mb-2 d-block" style="font-size: 0.9rem;"><i class="fa-solid fa-wallet text-gold"></i> المحفظة الإلكترونية (رقم الموبايل)</label>
                            <input type="text" id="admin-wallet" class="form-control text-left" dir="ltr" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 12px; font-family: monospace;" value="${adminData.payoutDetails.wallet || ''}">
                        </div>

                        <label class="text-white mb-2 d-block" style="font-size: 0.9rem;"><i class="fa-brands fa-cc-visa text-gold"></i> الحساب البنكي</label>
                        <div class="form-group mb-3">
                            <input type="text" id="admin-holder" placeholder="اسم صاحب الحساب" class="form-control text-right" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 12px;" value="${adminData.payoutDetails.accountHolder || ''}">
                        </div>
                        <div class="form-group mb-3">
                            <input type="text" id="admin-bank" placeholder="اسم البنك" class="form-control text-right" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 12px;" value="${adminData.payoutDetails.bankName || ''}">
                        </div>
                        <div class="form-group mb-4">
                            <input type="text" id="admin-iban" placeholder="الآيبان IBAN" class="form-control text-left" dir="ltr" style="background: var(--bg-main); border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 12px; font-family: monospace; font-size: 1.1rem; letter-spacing: 1px;" value="${adminData.payoutDetails.bankIban || ''}">
                        </div>

                        <button class="btn btn-primary w-100" style="padding: 15px; font-size: 1.1rem; font-weight: bold;" onclick="app.saveAdminPayoutDetails()">حفظ بيانات التحصيل</button>
                    </div>
                </div>

                <!-- Tab 3: Subscription Engine -->
                <div id="admin-content-3" class="admin-content" style="display: none;">
                    <div class="pill-box text-right mb-4">
                        <h3 class="text-gold mb-3"><i class="fa-solid fa-tags"></i> تسعير الباقات</h3>
                        <p class="text-muted mb-4" style="font-size: 0.85rem;">حدد أسعار الباقات التي سيدفعها الحلاقون لاستخدام المنصة.</p>
                        
                        <div class="form-group mb-3 text-right">
                            <label class="text-white mb-2 d-block">الاشتراك الشهري (30 يوم) - JOD</label>
                            <input type="number" class="form-control" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff;" value="${adminData.subscriptionPrices.monthly}">
                        </div>
                        <div class="form-group mb-4 text-right">
                            <label class="text-white mb-2 d-block">الاشتراك السنوي (365 يوم) - JOD</label>
                            <input type="number" class="form-control" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff;" value="${adminData.subscriptionPrices.yearly}">
                        </div>
                        <button class="btn btn-outline w-100" onclick="app.updateSubscriptionPrice()">تحديث الأسعار</button>
                    </div>

                    <div class="pill-box text-right mb-4 border-gold" style="background: rgba(212, 175, 55, 0.05);">
                        <h4 class="text-gold mb-2"><i class="fa-solid fa-robot"></i> أداة التنبيه الآلي</h4>
                        <p class="text-white mb-3" style="font-size: 0.85rem; line-height: 1.5;">النظام يقوم حالياً بإرسال رسائل WhatsApp وتنبيهات داخلية للحلاقين قبل 3 أيام من انتهاء اشتراكهم بشكل آلي بالكامل.</p>
                        <div class="text-success"><i class="fa-solid fa-circle-check"></i> تعمل الخدمة بكفاءة</div>
                    </div>
                </div>

                <!-- Tab 4: Manage Barbers -->
                <div id="admin-content-4" class="admin-content" style="display: none;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <button class="btn btn-primary" style="font-size: 0.8rem; padding: 8px 12px;"><i class="fa-solid fa-bullhorn"></i> بث للجميع</button>
                        <h3 class="text-gold m-0">قائمة الصالونات المشتركة</h3>
                    </div>
                    <div class="mb-5 text-right">
                        ${barbersRows}
                    </div>
                </div>

            </div>
            
            <div class="bottom-nav-container">
                <div class="bottom-nav">
                    <div class="nav-item cursor-pointer" onclick="app.navigate('welcome')">
                        <i class="fa-solid fa-right-from-bracket text-danger"></i>
                        <span class="text-danger">تسجيل خروج آمن</span>
                    </div>
                    <div class="nav-item cursor-pointer text-gold">
                        <i class="fa-solid fa-user-tie"></i>
                        <span>حساب الإدارة</span>
                    </div>
                </div>
            </div>
        `;
    }
};

window.UI = UI;
