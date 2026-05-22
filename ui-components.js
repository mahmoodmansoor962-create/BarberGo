// Advanced UI Components and View Renderers for BarberGo
// Note: Header components (renderTopHeader, renderBottomNav) are now in component-header.js
// Note: Login forms are now in component-loginform.js

const UI = {
    // Use separated header components for better performance
    renderTopHeader(title = 'BarberGo') {
        return window.HeaderComponent ? window.HeaderComponent.renderTopHeader(title) : '';
    },

    renderBottomNav(activeTab = 'home') {
        return window.HeaderComponent ? window.HeaderComponent.renderBottomNav(activeTab) : '';
    },

    renderLoadingIndicator() {
        return `<div class="barbergo-loading-spinner"></div>`;
    },

    renderLoadingPlaceholder(message = 'جاري تحميل المحتوى...') {
        return `
            <div class="page container py-5 text-center" style="min-height: calc(100vh - 90px); background: var(--bg-main);">
                <div class="pill-box" style="padding: 30px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    ${this.renderLoadingIndicator()}
                    <div class="text-gold" style="font-size: 1.25rem; margin-top: 20px;">${message}</div>
                    <div class="text-muted" style="font-size: 0.95rem; margin-top: 10px;">الرجاء الانتظار قليلاً بينما يتم تحميل البيانات.</div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 1. Client Features
    // ==========================================
    renderClientHome() {
        // Sort barbers so that favorites are on top
        const sortedBarbers = [...db.barbers]
            .filter(b => b.isPublished !== false) // Default to true if undefined, but hide if explicitly false
            .sort((a, b) => {
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
                        <input type="text" id="client-search-input" class="form-control" style="background: transparent; border: none; flex: 1; padding: 10px; color: #fff; text-align: right; outline: none; font-size: 1rem;" placeholder="${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].searchPlaceholder}" onkeyup="app.debouncedFilterBarbers()">
                        <button class="voice-btn btn btn-primary" style="border-radius: 50%; width: 50px; height: 50px; padding: 0;" onclick="app.startVoiceSearch(this)"><i class="fa-solid fa-microphone"></i></button>
                    </div>
                    <h3 class="mb-3 text-right">${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].suggestedBarbers}</h3>
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
                    <button class="btn btn-primary" onclick="app.navigate('bookingFlow', { barberId: ${barber.id}, serviceId: ${s.id} })">${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].bookAppointment}</button>
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
                    
                    <h3 class="text-right text-gold mb-3"><i class="fa-regular fa-calendar"></i> ${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].services}</h3>
                    <div class="services-container mb-4">${servicesHtml}</div>

                    <div class="ai-camera-box pill-box pill-box-outline cursor-pointer" onclick="app.navigate('aiCamera')">
                        <div class="ai-icon"><i class="fa-solid fa-camera"></i></div>
                        <h3 class="text-gold mb-1">${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].aiMirror}</h3>
                        <p class="text-muted" style="font-size: 0.8rem;">${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].aiDesc}</p>
                    </div>

                    <h3 class="text-right text-gold mb-3"><i class="fa-solid fa-map-location-dot"></i> ${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].location}</h3>
                    
                    <div class="address-box">
                        <button class="btn btn-ghost" style="padding: 5px 10px; border: 1px solid var(--gold-primary); color: var(--gold-primary);"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
                        <div class="text-right">
                            <div class="text-muted" style="font-size: 0.8rem;">${window.i18n[window.app && window.app.language ? window.app.language : localStorage.getItem('barbergo_lang') || 'ar'].address}</div>
                            <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">${barber.location}</div>
                        </div>
                        <div class="address-icon"><i class="fa-solid fa-location-dot"></i></div>
                    </div>

                    <div class="social-icons-row mb-3">
                        <div class="social-icon call" onclick="window.location.href='tel:${barber.phone}'"><i class="fa-solid fa-phone"></i><span>Call</span></div>
                        <div class="social-icon whatsapp" onclick="window.open('https://wa.me/${barber.social && barber.social.whatsapp ? barber.social.whatsapp : barber.phone}')"><i class="fa-brands fa-whatsapp"></i><span>Whatsapp</span></div>
                        ${barber.social && barber.social.facebook ? `<div class="social-icon facebook" onclick="window.open('${barber.social.facebook}')"><i class="fa-brands fa-facebook-f"></i><span>FB</span></div>` : `<div class="social-icon facebook" style="opacity: 0.5;"><i class="fa-brands fa-facebook-f"></i><span>FB</span></div>`}
                        ${barber.social && barber.social.instagram ? `<div class="social-icon instagram" onclick="window.open('${barber.social.instagram}')"><i class="fa-brands fa-instagram"></i><span>Insta</span></div>` : `<div class="social-icon instagram" style="opacity: 0.5;"><i class="fa-brands fa-instagram"></i><span>Insta</span></div>`}
                        ${barber.social && barber.social.website ? `<div class="social-icon website" style="color: #3498db;" onclick="window.open('${barber.social.website}')"><i class="fa-solid fa-globe"></i><span>Web</span></div>` : `<div class="social-icon website" style="opacity: 0.5; color: #3498db;"><i class="fa-solid fa-globe"></i><span>Web</span></div>`}
                    </div>

                    ${barber.settings && barber.settings.enableEmergency ? `
                        <div class="pill-box cursor-pointer mb-3" style="border: 1px solid #e74c3c; background: rgba(231, 76, 60, 0.1);" onclick="app.triggerEmergency()">
                            <h3 class="text-danger m-0 d-flex justify-content-center align-items-center gap-2">
                                <i class="fa-solid fa-truck-medical"></i> طلب حجز طارئ!
                            </h3>
                        </div>
                    ` : ''}

                    ${barber.homeService ? `
                        <div class="pill-box cursor-pointer mb-3" style="border: 1px solid #2ecc71; background: rgba(46, 204, 113, 0.1);">
                            <h3 class="text-success m-0 d-flex justify-content-center align-items-center gap-2" style="font-size: 1.1rem;">
                                <i class="fa-solid fa-house-chimney"></i> تتوفر خدمة الحلاقة المنزلية
                            </h3>
                        </div>
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
                                <button class="btn btn-outline btn-block text-white" style="border-color: #333; color: #fff !important;" onclick="app.togglePreOrderProduct(${p.id}, this)">إضافه للطلب والتحضير</button>
                            </div>
                        `).join('')}
                    </div>
                    <div id="tab-content-gallery" class="products-grid profile-tab-content mb-5" style="display: none;">
                        ${barber.gallery && barber.gallery.length > 0 ? barber.gallery.map(img => `
                            <div class="product-card"><img src="${img}" style="height: 150px; object-fit: cover;"></div>
                        `).join('') : '<div class="text-center text-muted w-100 p-3">لا توجد صور في المعرض حالياً</div>'}
                    </div>
                    <div id="tab-content-reviews" class="profile-tab-content mb-5 text-right" style="display: none;">
                        <div class="pill-box">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <div style="font-weight: bold; font-size: 1.2rem; color: #fff;" id="barber-avg-rating">${barber.rating}</div>
                                <div class="text-gold"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div>
                            </div>
                            <p class="text-muted m-0" id="barber-reviews-count">بناءً على ${barber.reviewsCount || 120} تقييم</p>
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
                            <button class="btn btn-primary btn-block text-black" onclick="app.submitReview(${barber.id})">إرسال التقييم</button>
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
                                const allSlots = ['10:00 ص','10:30 ص','11:00 ص','11:30 ص','12:00 م','12:30 م','01:00 م','01:30 م','02:00 م','02:30 م','03:00 م','03:30 م','04:00 م','04:30 م','05:00 م','05:30 م','06:00 م','06:30 م','07:00 م','07:30 م','08:00 م','08:30 م','09:00 م','09:30 م','10:00 م'];
                                const barber = window.db.barbers.find(b => b.id === barberId);
                                const blockedTimes = barber.blockedTimes || [];
                                const bookedTimes = window.db.bookings.filter(b => b.barber_id === barberId && b.status !== 'cancelled').map(b => b.time);
                                
                                return allSlots.map(time => {
                                    if (blockedTimes.includes(time) || bookedTimes.includes(time)) {
                                        return `<div class="time-slot disabled" style="background: rgba(231,76,60,0.1); border: 1px dashed #e74c3c; color: #e74c3c; opacity: 0.7;" title="الوقت محجوز" onclick="app.simulateNotificationError('هذا الوقت غير متاح')">${time}</div>`;
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
                    <img id="ai-camera-placeholder" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80" style="width: 100%; height: 100%; object-fit: cover;">
                    <video id="ai-camera-feed" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
                    <img id="ai-mock-result" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    <div id="ai-scan-line" class="scan-line"></div>
                    <button id="flip-camera-btn" class="btn btn-ghost" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; display: none; z-index: 10; border: 1px solid var(--gold-primary);" onclick="app.flipCamera()">
                        <i class="fa-solid fa-camera-rotate"></i> قلب الكاميرا
                    </button>
                </div>
                
                <div id="ai-results-actions" style="display: none;" class="mt-4">
                    <h4 class="text-success mb-3" style="font-size: 1rem;"><i class="fa-solid fa-check-circle"></i> تم العثور على القصة المثالية!</h4>
                    <button class="btn btn-primary mb-2 w-100" onclick="window.notifier.show('تم الإرسال', 'تم إرسال الصورة بنجاح. سيقوم الحلاق بالاطلاع عليها لتجهيز القصة!', 'success')">
                        <i class="fa-solid fa-paper-plane"></i> إرسال الصورة للحلاق
                    </button>
                    <button class="btn btn-outline mb-2 w-100" onclick="window.notifier.show('تم التحميل', 'تم حفظ الصورة في الاستوديو بنجاح.', 'success')">
                        <i class="fa-solid fa-download"></i> تحميل الصورة لجهازي
                    </button>
                    <button class="btn btn-ghost w-100 text-gold" onclick="app.navigate('clientHome')">العودة للرئيسية</button>
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

                    <h3 class="text-gold mt-5 mb-4"><i class="fa-solid fa-calendar-check"></i> حجوزاتي القادمة</h3>
                    <div id="client-bookings-list">
                        ${(() => {
                            const clientName = localStorage.getItem('barbergo_client_name');
                            if (!clientName) return '<p class="text-muted text-center py-3">لا توجد حجوزات حالياً.</p>';
                            
                            const myBookings = window.db.bookings.filter(b => b.customer_name === clientName);
                            if (myBookings.length === 0) return '<p class="text-muted text-center py-3">لا توجد حجوزات حالياً.</p>';
                            
                            return myBookings.map(b => {
                                const bBarber = window.db.barbers.find(barb => barb.id === b.barber_id);
                                const bService = window.db.services.find(s => s.id === b.service_id);
                                const bName = bBarber ? bBarber.name : 'حلاق غير معروف';
                                const sName = bService ? bService.name : 'خدمة غير معروفة';
                                
                                return `
                                <div class="pill-box mb-3 p-3" style="border-right: 3px solid ${b.status === 'cancelled' ? '#e74c3c' : 'var(--gold-primary)'}; background: var(--bg-main);">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <h4 class="m-0 text-white">${sName}</h4>
                                        <div class="text-gold" style="font-weight: bold;">${b.time}</div>
                                    </div>
                                    <div class="text-muted mb-3" style="font-size: 0.85rem;"><i class="fa-solid fa-store"></i> ${bName}</div>
                                    
                                    ${b.status !== 'cancelled' ? `
                                        <button class="btn btn-outline w-100 text-danger" style="border-color: #e74c3c; padding: 10px;" onclick="app.cancelClientBooking(${b.id})">
                                            إلغاء الموعد (مسموح قبل ساعة)
                                        </button>
                                    ` : `
                                        <div class="text-danger text-center" style="font-weight: bold;"><i class="fa-solid fa-circle-xmark"></i> تم الإلغاء</div>
                                    `}
                                </div>`;
                            }).join('');
                        })()}
                    </div>
                </div>
            </div>
            ${this.renderBottomNav('settings')}
        `;
    },

    renderClientNotifications() {
        const customerName = localStorage.getItem('barbergo_client_name');
        const notifications = (window.db.notifications || []).filter(n => n.customerName === customerName && !n.archived).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const notificationsHtml = notifications.length ? notifications.map(n => `
            <div class="pill-box mb-4 p-4" style="border: 1px solid var(--gold-primary); background: var(--bg-main);">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h3 class="text-gold mb-2">إشعار تقييم الخدمة</h3>
                        <p class="text-white mb-0" style="font-size: 0.95rem; line-height: 1.7;">${n.message}</p>
                    </div>
                    <span class="text-muted" style="font-size: 0.75rem;">${new Date(n.createdAt).toLocaleString('ar-EG')}</span>
                </div>
                <div class="form-group text-right mb-3">
                    <div class="text-white mb-2" style="font-size: 0.9rem;">قيم تجربتك الآن: <span id="feedback-value-${n.id}" class="text-gold">80%</span></div>
                    <input type="range" id="feedback-slider-${n.id}" min="0" max="100" value="80" oninput="document.getElementById('feedback-value-${n.id}').innerText = this.value + '%';" style="width: 100%; accent-color: var(--gold-primary); background: transparent;">
                </div>
                <div class="d-flex flex-column gap-2" style="margin-top: 15px;">
                    <button class="btn btn-primary w-100" onclick="app.submitFeedback(${n.barberId}, ${n.id})">إرسال التقييم لكابتن ${n.barberName}</button>
                    <button class="btn btn-ghost w-100 text-gold" onclick="app.archiveNotification(${n.id})">إغلاق</button>
                </div>
            </div>
        `).join('') : `
            <div class="pill-box p-4 text-center" style="background: var(--bg-main); border: 1px solid var(--border-color);">
                <p class="text-muted mb-0" style="font-size: 0.95rem; line-height: 1.7;">${customerName ? 'لا توجد إشعارات جديدة حالياً. ستظهر إشعار التقييم هنا بعد انتهاء موعدك بساعة واحدة.' : 'لم يتم تسجيل اسم العميل بعد. يرجى حجز موعد أولاً لتلقي إشعارات التقييم.'}</p>
            </div>
        `;

        return `
            ${this.renderTopHeader('قائمة الإشعارات')}
            <div class="page container py-4" style="padding-bottom: 100px;">
                <div class="pill-box text-right mb-4" style="border: 1px solid var(--gold-primary);">
                    <h3 class="text-gold mb-2"><i class="fa-solid fa-bell"></i> قائمة الإشعارات</h3>
                    <p class="text-muted mb-0" style="font-size: 0.9rem; line-height: 1.6;">هنا سيتم عرض طلب تقييم بعد ساعة من انتهاء موعدك، بالإضافة إلى زر الإرسال أو الإغلاق اختياري.</p>
                </div>
                ${notificationsHtml}
            </div>
            ${this.renderBottomNav('home')}
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
        return window.LoginFormComponent ? window.LoginFormComponent.renderBarberLogin() : '';
    },

    renderBarberEmailSetup() {
        return window.LoginFormComponent ? window.LoginFormComponent.renderBarberEmailSetup() : '';
    },

    renderBarberDashboard(barberId) {
        return `
            <div class="page container py-5 text-center">
                <div class="pill-box" style="padding: 30px;">
                    <div class="text-gold" style="font-size: 1.25rem;">جاري تحميل المحتوى...</div>
                    <p class="text-muted" style="font-size: 0.95rem;">يرجى الانتظار بينما يتم تحميل لوحة تحكم الحلاق.</p>
                </div>
            </div>
        `;
    },

    renderAdminLogin() {
        return window.LoginFormComponent ? window.LoginFormComponent.renderAdminLogin() : '';
    },

    renderAdminEmailSetup() {
        return window.LoginFormComponent ? window.LoginFormComponent.renderAdminEmailSetup() : '';
    },

    renderAdminDashboard() {
        return `
            <div class="page container py-5 text-center">
                <div class="pill-box" style="padding: 30px;">
                    <div class="text-gold" style="font-size: 1.25rem;">جاري تحميل المحتوى...</div>
                    <p class="text-muted" style="font-size: 0.95rem;">يرجى الانتظار بينما يتم تحميل لوحة تحكم الإدارة.</p>
                </div>
            </div>
        `;
    }

};

window.UI = UI;
