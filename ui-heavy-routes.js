// Heavy route renderers loaded on demand for BarberGo
window.UI = window.UI || {};

UI.renderBarberDashboard = function(barberId) {
    const barber = db.barbers.find(b => b.id === barberId);
    return `
            ${this.renderTopHeader('لوحة تحكم: ' + barber.name)}
            <div class="page container py-3" style="padding-bottom: 100px;">
                
                ${(() => {
                    const expiryRaw = barber.subscriptionEndDate || barber.expiryDate || barber.subscriptionEnd || null;
                    if (!expiryRaw) return '';
                    const expiry = new Date(expiryRaw);
                    if (isNaN(expiry.getTime())) return '';
                    const remainingMs = expiry.getTime() - Date.now();
                    const twoDaysMs = 48 * 60 * 60 * 1000;
                    if (remainingMs <= twoDaysMs && remainingMs >= 0) {
                        return `
                    <div class="pill-box mb-4 text-right" style="border-right: 4px solid var(--gold-primary); background: rgba(212,175,55,0.05);">
                        <h4 class="text-gold mb-2"><i class="fa-solid fa-triangle-exclamation"></i> تنبيه: اشتراكك سينتهي قريباً</h4>
                        <p class="text-white mb-3" style="font-size: 0.85rem; line-height: 1.6;">ستنتهي صلاحية اشتراكك خلال أقل من يومين. يرجى تجديده للحفاظ على ظهور الصالون أمام العملاء.</p>
                        <button class="btn btn-outline text-gold w-100" style="border-color: var(--gold-primary);" onclick="app.showAdminPayoutDetails()">إظهار بيانات الدفع</button>
                    </div>
                        `;
                    }
                    return '';
                })()}

                <div class="tabs-container" style="overflow-x: auto; white-space: nowrap; gap: 15px; border-bottom: none; margin-bottom: 25px; padding-bottom: 10px;">
                    <button class="btn btn-ghost bdash-tab-item active" id="bdash-tab-1" onclick="app.switchBarberDashboardTab(1)">إحصائيات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-9" onclick="app.switchBarberDashboardTab(9)">حجوزات العملاء</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-2" onclick="app.switchBarberDashboardTab(2)">ملفي</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-3" onclick="app.switchBarberDashboardTab(3)">الخدمات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-4" onclick="app.switchBarberDashboardTab(4)">التقويم</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-5" onclick="app.switchBarberDashboardTab(5)">المتجر</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-7" onclick="app.switchBarberDashboardTab(7)">معرض الصور</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-8" onclick="app.switchBarberDashboardTab(8)">التقييمات</button>
                    <button class="btn btn-ghost bdash-tab-item" id="bdash-tab-10" onclick="app.switchBarberDashboardTab(10)">تقييم العملاء</button>
                </div>

                <div id="bdash-content-1" class="bdash-content">
                    <h3 class="text-gold text-right mb-3"><i class="fa-solid fa-chart-line"></i> إحصائيات متقدمة</h3>
                    <div class="products-grid mb-4" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${(() => {
                            const bBookings = db.bookings.filter(b => b.barber_id === barberId);
                            const confirmedBookings = bBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
                            const totalRev = confirmedBookings.reduce((sum, b) => {
                                const svc = db.services.find(s => s.id === b.service_id);
                                return sum + (svc ? svc.price : 0);
                            }, 0);
                            const dailyRev = Math.round(totalRev * 0.1);
                            const weeklyRev = Math.round(totalRev * 0.4);
                            const uniqueClients = new Set(bBookings.map(b => b.client_id)).size;
                            const loyalty = uniqueClients > 0 ? Math.round((confirmedBookings.length / uniqueClients) * 30) : 0;
                            const displayLoyalty = Math.min(loyalty + 50, 98);
                            const svcCounts = {};
                            bBookings.forEach(b => {
                                svcCounts[b.service_id] = (svcCounts[b.service_id] || 0) + 1;
                            });
                            let topSvcId = Object.keys(svcCounts).sort((a,b) => svcCounts[b] - svcCounts[a])[0];
                            let topSvcName = 'لا يوجد';
                            if (topSvcId) {
                                const svc = db.services.find(s => s.id == topSvcId);
                                if (svc && svc.name) topSvcName = svc.name;
                            }
                            const cancelRate = bBookings.length ? Math.round((bBookings.filter(b => b.status === 'cancelled').length / bBookings.length) * 100) : 0;

                            return `
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-sack-dollar text-gold"></i> صافي الأرباح <span style="font-size: 0.6rem">(JOD)</span></div>
                            <div class="d-flex justify-content-between mt-2 text-center" style="gap: 5px;">
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">يومي</div><div class="text-white" style="font-size: 0.9rem; font-weight: bold;">${dailyRev || 0}</div></div>
                                <div style="width: 1px; background: #333;"></div>
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">أسبوعي</div><div class="text-white" style="font-size: 0.9rem; font-weight: bold;">${weeklyRev || 0}</div></div>
                                <div style="width: 1px; background: #333;"></div>
                                <div style="flex:1"><div style="font-size: 0.65rem; color: #888;">إجمالي</div><div class="text-gold" style="font-size: 0.9rem; font-weight: bold;">${totalRev || 0}</div></div>
                            </div>
                        </div>
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-users text-info"></i> عدد العملاء الفريدين</div>
                            <h4 class="text-white m-0" style="font-size: 1.5rem;">${uniqueClients} <span style="font-size: 0.8rem; color: #2ecc71;"><i class="fa-solid fa-arrow-trend-up"></i></span></h4>
                        </div>
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-fire text-danger"></i> الخدمة الأكثر طلباً</div>
                            <h4 class="text-gold m-0" style="font-size: 1.1rem; padding-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${topSvcName}</h4>
                        </div>
                        <div class="pill-box pill-box-outline text-right p-3 m-0 d-flex flex-column justify-content-between">
                            <div class="text-muted mb-2" style="font-size: 0.8rem;"><i class="fa-solid fa-triangle-exclamation text-warning"></i> معدل الإلغاء</div>
                            <h4 class="text-white m-0" style="font-size: 1.5rem;">${cancelRate}% <span style="font-size: 0.8rem; color: #e74c3c;"><i class="fa-solid fa-arrow-trend-down"></i></span></h4>
                        </div>
                            `;
                        })()}
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

                <div id="bdash-content-9" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right mb-4">
                        <h4 class="text-white mb-3" style="font-size: 1.1rem;"><i class="fa-solid fa-calendar-check text-success"></i> الحجوزات القادمة</h4>
                        ${(() => {
                            const bBookings = window.db.bookings.filter(b => b.barber_id === barberId);
                            const upcoming = bBookings.filter(b => b.status !== 'cancelled');
                            if (upcoming.length === 0) return '<p class="text-muted text-center py-3">لا توجد حجوزات قادمة حالياً.</p>';
                            return upcoming.map(b => {
                                const svc = window.db.services.find(s => s.id === b.service_id);
                                const svcName = svc ? svc.name : 'خدمة غير معروفة';
                                return `
                                <div class="booking-item mb-3 p-3" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); border-right: 3px solid #2ecc71;">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div class="text-gold" style="font-size: 1.1rem; font-weight: bold;">${b.customer_name}</div>
                                        <div class="text-muted" style="font-size: 0.85rem;"><i class="fa-regular fa-clock"></i> ${b.time}</div>
                                    </div>
                                    <div class="text-white mb-3" style="font-size: 0.9rem;"><i class="fa-solid fa-scissors text-muted"></i> ${svcName}</div>
                                    ${b.preOrderProducts && b.preOrderProducts.length ? '<div class="text-gold mb-2" style="font-size: 0.95rem; font-weight:600;">المنتجات المطلوب تحضيرها: ' + (b.preOrderProducts.map(function(p){ return p.productName; }).join(', ')) + '</div>' : ''}
                                    <button class="btn w-100 mt-2 text-danger" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); font-weight: bold; padding: 10px;" onclick="app.cancelBooking(this, '${b.customer_name}')">إلغاء الحجز وإرسال تنبيه للعميل</button>
                                </div>`;
                            }).join('');
                        })()}
                    </div>
                </div>

                <div id="bdash-content-2" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right">
                        <h4 class="text-gold mb-4"><i class="fa-solid fa-address-card"></i> إعدادات الملف الشخصي</h4>
                        <div class="form-group mb-4 text-center">
                            <label class="text-gold mb-2 d-block text-right" style="font-weight: bold;"><i class="fa-solid fa-image"></i> صورة الغلاف للصالون (Cover Image)</label>
                            <input type="file" id="cover-image-upload" accept="image/*" style="display: none;" onchange="app.handleImageUpload(event, 'cover')">
                            <div style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05); padding: 25px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.3s;" onclick="document.getElementById('cover-image-upload').click()">
                                <i class="fa-solid fa-cloud-arrow-up mb-2" style="font-size: 2.5rem; color: var(--gold-primary);"></i>
                                <div class="text-white" style="font-weight: bold;">اضغط هنا لرفع صورة الغلاف</div>
                                <div class="text-muted mt-1" style="font-size: 0.8rem;">الصورة التي تظهر للعملاء في أعلى صفحتك</div>
                                <div id="cover-upload-status" class="mt-2"></div>
                            </div>
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-store"></i> اسم الصالون (Shop Name)</label>
                            <input type="text" id="barber-edit-name" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.name}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-pen-nib"></i> السيرة الذاتية (Bio)</label>
                            <textarea id="barber-edit-bio" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--gold-primary); color: #fff; padding: 15px; border-radius: var(--radius-sm); font-size: 0.95rem; text-align: right; resize: vertical; line-height: 1.6; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);" rows="3" placeholder="اكتب نبذة عنك وعن خبراتك لكي يراها عملاؤك...">${barber.bio || ''}</textarea>
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-mobile-screen"></i> رقم الهاتف</label>
                            <input type="text" id="barber-edit-phone" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.phone}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> رقم الواتساب</label>
                            <input type="text" id="barber-edit-whatsapp" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${(barber.social && barber.social.whatsapp) || barber.phone}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-brands fa-instagram" style="color: #e1306c;"></i> رابط صفحة الانستغرام</label>
                            <input type="text" id="barber-edit-instagram" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${(barber.social && barber.social.instagram) || ''}" placeholder="https://instagram.com/...">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-brands fa-facebook" style="color: #1877F2;"></i> رابط صفحة الفيسبوك</label>
                            <input type="text" id="barber-edit-facebook" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${(barber.social && barber.social.facebook) || ''}" placeholder="https://facebook.com/...">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-location-dot" style="color: #3498db;"></i> الموقع الجغرافي (العنوان الكامل)</label>
                            <input type="text" id="barber-edit-location" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${barber.location}">
                        </div>

                        <div class="form-group mb-4">
                            <label class="text-gold mb-2 d-block" style="font-weight: bold;"><i class="fa-solid fa-globe" style="color: #3498db;"></i> رابط موقعك الإلكتروني (Website)</label>
                            <input type="text" id="barber-edit-website" class="form-control" style="width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 15px; border-radius: var(--radius-sm); text-align: right; font-size: 1rem;" value="${(barber.social && barber.social.website) || ''}" placeholder="https://yourwebsite.com">
                        </div>

                        <div class="pill-box p-3 mb-4 mt-4 text-right" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color);">
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

                        <button class="btn btn-primary w-100 mt-3" style="padding: 15px; font-size: 1.1rem;" onclick="app.saveBarberSettings()">حفظ التعديلات الفعلية</button>

                        <div class="mt-4 pt-4 text-center" style="border-top: 1px dashed var(--gold-primary);">
                            <h4 class="text-white mb-2">هل أكملت إعداد صفحتك؟</h4>
                            <p class="text-muted mb-3" style="font-size: 0.85rem;">انشر بروفايلك ليتمكن العملاء من رؤيته والحجز لديك فوراً</p>
                            <button class="btn w-100 ${barber.isPublished ? 'btn-success' : 'btn-outline text-gold'}" style="${!barber.isPublished ? 'border-color: var(--gold-primary);' : ''} padding: 15px; font-size: 1.2rem; font-weight: bold;" onclick="app.togglePublishProfile(this)">
                                ${barber.isPublished ? '<i class="fa-solid fa-globe"></i> البروفايل منشور وعام للعملاء' : '<i class="fa-solid fa-rocket"></i> نشر البروفايل للعملاء'}
                            </button>
                        </div>

                        <div class="pill-box text-right mt-4 border-gold">
                            <h4 class="text-gold mb-3"><i class="fa-solid fa-wallet"></i> إعدادات الدفع للعملاء (Payment)</h4>
                            <p class="text-muted mb-4" style="font-size: 0.85rem; line-height: 1.5;">قم بإضافة تفاصيل وسائل الدفع الخاصة بك ليتمكن العملاء من الدفع مسبقاً إذا رغبوا. الحجز يبقى مستقلاً وتأكيده لا يتطلب الدفع.</p>
                            
                            <div class="form-group mb-4">
                                <label class="text-white mb-2 d-flex justify-content-between"><span>معرف كليك (CliQ Alias)</span> <span class="text-success" style="font-size: 0.8rem;">${(barber.paymentMethods && barber.paymentMethods.cliq) ? 'مفعل' : 'معطل'}</span></label>
                                <input type="text" id="barber-payment-cliq" class="form-control text-left" dir="ltr" placeholder="مثال: AHMAD199" style="background: var(--bg-main); border-color: var(--border-color); color: #fff;" value="${(barber.paymentMethods && barber.paymentMethods.cliq) || ''}">
                            </div>

                            <div class="form-group mb-4">
                                <label class="text-white mb-2 d-flex justify-content-between"><span>رقم المحفظة (Wallet)</span> <span class="text-success" style="font-size: 0.8rem;">${(barber.paymentMethods && barber.paymentMethods.wallet) ? 'مفعل' : 'معطل'}</span></label>
                                <input type="text" id="barber-payment-wallet" class="form-control text-left" dir="ltr" placeholder="07XXXXXXXX" style="background: var(--bg-main); border-color: var(--border-color); color: #fff;" value="${(barber.paymentMethods && barber.paymentMethods.wallet) || ''}">
                            </div>

                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 class="m-0 text-white"><i class="fa-brands fa-cc-visa text-gold"></i> الدفع بالبطاقة بالصالون</h4>
                                </div>
                                <button id="btn-toggle-visa" class="btn ${barber.paymentMethods && barber.paymentMethods.visa ? 'btn-primary' : 'btn-ghost text-muted'}" style="border: 1px solid var(--border-color);" onclick="app.toggleBarberSettingParam(this, 'visaPayment')">
                                    ${barber.paymentMethods && barber.paymentMethods.visa ? 'مفعل' : 'معطل'}
                                </button>
                            </div>

                            <button class="btn btn-primary w-100" onclick="app.saveBarberPayment()">حفظ وسائل الدفع</button>
                        </div>
                    </div>
                </div>

                <div id="bdash-content-3" class="bdash-content" style="display: none;">
                    <div class="pill-box p-3 mb-4 text-center cursor-pointer" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="app.simulateAddService()">
                        <h4 class="text-gold m-0"><i class="fa-solid fa-plus"></i> إضافة خدمة يدوية جديدة</h4>
                        <div class="text-muted mt-1" style="font-size: 0.85rem;">أضف اسم الخدمة، السعر، والوقت المستغرق</div>
                    </div>
                    <div id="services-list-container">
                    ${db.services.filter(s => s.barber_id === barberId).map(s => `
                        <div id="svc-${s.id}" class="pill-box p-3 mb-2 d-flex justify-content-between align-items-center" style="border-left: 3px solid var(--gold-primary);">
                            <div class="text-right">
                                <h4 class="m-0 text-white">${s.name}</h4>
                                <div class="text-muted" style="font-size: 0.85rem; margin-top: 5px;"><i class="fa-regular fa-clock"></i> ${s.duration} دقيقة | <i class="fa-solid fa-tag"></i> JOD ${s.price}</div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <button class="btn btn-ghost p-2 text-gold" title="تعديل" onclick="app.startEditService(${s.id}, this)"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-ghost text-danger p-2" title="حذف" onclick="app.confirmDeleteService(${s.id}, this)"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                    </div>
                    <button class="btn btn-primary w-100 mt-3" onclick="window.notifier.show('تم الحفظ', 'تم حفظ الخدمات بنجاح وستظهر للعملاء الآن.', 'success')">حفظ الخدمات والتغييرات</button>
                </div>

                <div id="bdash-content-4" class="bdash-content" style="display: none;">
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
                            <label class="text-gold mb-2 d-block" style="font-size: 0.85rem;">مدة الجلسة (وقت الموعد التلقائي)</label>
                            <select class="form-control text-right" style="background: var(--bg-main); border: 1px solid var(--border-color); color: #fff; padding: 10px;">
                                <option>15 دقيقة</option>
                                <option>30 دقيقة</option>
                                <option>45 دقيقة</option>
                                <option selected>60 دقيقة</option>
                            </select>
                        </div>
                        <div class="form-group mt-3">
                            <label class="text-gold mb-2 d-block" style="font-size: 0.85rem;"><i class="fa-solid fa-calendar-xmark"></i> أيام العطلة الأسبوعية (Holidays)</label>
                            <p class="text-muted mb-2" style="font-size: 0.75rem;">اختر الأيام التي تغلق بها صالونك ولن يتمكن العملاء من الحجز فيها.</p>
                            <div class="d-flex flex-wrap justify-content-center" style="gap: 10px; display: grid !important; grid-template-columns: repeat(4, 1fr);" id="barber-holidays-container">
                                ${['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => {
                                    const isHoliday = barber.holidays && barber.holidays.includes(index);
                                    return `<button class="btn ${isHoliday ? 'btn-danger text-white' : 'btn-outline text-muted'}" style="${!isHoliday ? 'border-color: var(--border-color);' : ''} border-radius: 12px; padding: 8px 5px; font-size: 0.85rem;" onclick="app.toggleBarberHoliday(this, ${index})">${day}</button>`;
                                }).join('')}
                            </div>
                        </div>
                        <button class="btn btn-primary w-100 mt-4" style="padding: 12px; font-size: 1rem;" onclick="window.notifier.show('تم الحفظ', 'تم حفظ أوقات العمل والعطل بنجاح', 'success')">حفظ الأوقات المدخلة</button>
                    </div>
                    <div class="pill-box text-right">
                        <h4 class="text-danger mb-3" style="font-size: 1.1rem;"><i class="fa-solid fa-ban"></i> قفل أوقات (طوارئ / استراحة)</h4>
                        <p class="text-muted mb-3" style="font-size: 0.85rem; line-height: 1.5;">اضغط على أي وقت لتقوم بإغلاقه حتى وإن لم يكن هناك حجز مسبق، وسيظهر للعملاء كـ "غير متاح".</p>
                        <div class="schedule-grid" id="barber-block-grid" style="grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            ${(() => {
                                const allSlots = ['10:00 ص','10:30 ص','11:00 ص','11:30 ص','12:00 م','12:30 م','01:00 م','01:30 م','02:00 م','02:30 م','03:00 م','03:30 م','04:00 م','04:30 م','05:00 م','05:30 م','06:00 م','06:30 م','07:00 م','07:30 م','08:00 م','08:30 م','09:00 م','09:30 م','10:00 م'];
                                const blockedTimes = barber.blockedTimes || [];
                                const bookedTimes = window.db.bookings.filter(b => b.barber_id === barber.id).map(b => b.time);
                                return allSlots.map(time => {
                                    if (bookedTimes.includes(time)) {
                                        return `<div class="time-slot disabled" style="background: rgba(231,76,60,0.2); border: 1px dashed #e74c3c; color: #e74c3c; opacity: 1;" onclick="app.simulateNotificationError('حاول إلغاء الحجز من القائمة أولاً')">${time} (حجز فعلي)</div>`;
                                    } else if (blockedTimes.includes(time)) {
                                        return `<div class="time-slot blocked-slot selected" style="background: #e74c3c; border-color: #e74c3c; opacity: 0.8; color: #fff;" onclick="app.toggleBlockTime(this)">${time}</div>`;
                                    } else {
                                        return `<div class="time-slot" onclick="app.toggleBlockTime(this)">${time}</div>`;
                                    }
                                }).join('');
                            })()}
                        </div>
                        <button class="btn btn-primary w-100 mt-3" onclick="app.saveBlockedTimes()">حفظ الأوقات المقفلة</button>
                    </div>
                </div>

                <div id="bdash-content-5" class="bdash-content" style="display: none;">
                     <div class="pill-box p-3 mb-4 text-center" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="app.simulateAddProduct()">
                         <h4 class="text-gold m-0"><i class="fa-solid fa-plus"></i> إضافة منتج جديد للمتجر</h4>
                         <div class="text-muted mt-1" style="font-size: 0.85rem;">أضف اسم المنتج، السعر، والوقت المستغرق</div>
                     </div>
                     <div class="products-grid" id="store-products-list" style="grid-template-columns: 1fr 1fr; gap: 15px;">
                         <div class="pill-box p-2 text-center" style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                             <img src="https://images.unsplash.com/photo-1599305090598-fe179d501227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60&fm=webp" width="320" height="120" loading="lazy" decoding="async" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                             <h4 class="text-white m-0" style="font-size: 0.95rem;">شامبو اللحية الفاخر</h4>
                             <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">12 JOD</div>
                         </div>
                         <div class="pill-box p-2 text-center" style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%;" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
                             <img src="https://images.unsplash.com/photo-1621607512214-68297480165e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60&fm=webp" width="320" height="120" loading="lazy" decoding="async" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                             <h4 class="text-white m-0" style="font-size: 0.95rem;">جل العناية بالشعر</h4>
                             <div class="text-gold mt-1" style="font-size: 0.9rem; font-weight: bold;">8 JOD</div>
                         </div>
                     </div>
                </div>

                <div id="bdash-content-7" class="bdash-content" style="display: none;">
                    <input type="file" id="gallery-image-upload" accept="image/*" style="display: none;" onchange="app.handleImageUpload(event, 'gallery')">
                    <div class="pill-box p-3 mb-4 text-center cursor-pointer" style="border: 2px dashed var(--gold-primary); background: rgba(212, 175, 55, 0.05);" onclick="document.getElementById('gallery-image-upload').click()">
                         <h4 class="text-gold m-0"><i class="fa-solid fa-images"></i> رفع صورة جديدة لمعرض الأعمال</h4>
                         <div class="text-muted mt-1" style="font-size: 0.85rem;">الصور تجذب العملاء الجدد بنسبة 70% أكثر</div>
                     </div>
                     <div class="products-grid" id="gallery-images-list" style="grid-template-columns: repeat(3, 1fr); gap: 10px;">
                         ${barber.gallery && barber.gallery.length > 0 ? barber.gallery.map((img, idx) => `
                         <div style="position: relative;">
                             <button class="btn btn-ghost text-danger p-1" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; z-index: 2;" onclick="app.deleteGalleryImage(this, ${idx})"><i class="fa-solid fa-xmark"></i></button>
                             <img src="${img}" width="320" height="100" loading="lazy" decoding="async" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                         </div>
                         `).join('') : '<div class="text-muted text-center w-100 p-3">لم تقم برفع أي صور بعد</div>'}
                     </div>
                     <button class="btn btn-primary w-100 mt-4" onclick="window.notifier.show('تم الحفظ', 'تم حفظ الصور في المعرض بنجاح وستظهر للعملاء الآن.', 'success')">حفظ الصور في المعرض</button>
                </div>

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

                <div id="bdash-content-10" class="bdash-content" style="display: none;">
                    <div class="pill-box text-right mb-4 border-gold">
                        <h4 class="text-gold mb-3"><i class="fa-solid fa-comment-dots"></i> تقييم العملاء</h4>
                        <p class="text-muted mb-3" style="font-size: 0.9rem; line-height: 1.6;">سجل التقييمات التي أرسلها العملاء بعد إكمال حجوزاتهم. يظهر هنا اسم العميل والنسبة المئوية للتقييم.</p>
                        ${(() => {
                            const ratings = barber.ratings || [];
                            if (ratings.length === 0) {
                                return '<div class="text-muted text-center p-4" style="font-size: 0.95rem;">لا توجد تقييمات العملاء بعد. سيتم عرض التقييمات هنا فور إرسال العملاء لملاحظاتهم.</div>';
                            }
                            return ratings.map(r => `
                                <div class="pill-box mb-3 p-3" style="border: 1px solid var(--border-color); background: var(--bg-main);">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div class="text-white" style="font-weight: bold;">${r.customerName}</div>
                                        <div class="text-gold" style="font-weight: bold;">${r.ratingPercentage}%</div>
                                    </div>
                                    <div class="text-muted" style="font-size: 0.85rem;">${new Date(r.timestamp).toLocaleString('ar-EG')}</div>
                                </div>
                            `).join('');
                        })()}
                    </div>
                </div>

            </div>
            
            <div class="bottom-nav-container">
                <div class="bottom-nav">
                    <div class="nav-item cursor-pointer" onclick="app.navigate('welcome')">
                        <i class="fa-solid fa-right-from-bracket text-danger"></i>
                        <span class="text-danger">تسجيل خروج</span>
                    </div>
                </div>
            </div>
        `;
};

UI.renderAdminDashboard = function() {
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

        const trialBtn = `<button class="btn btn-outline text-gold p-1 ml-2" style="border-color: var(--gold-primary); font-size: 0.75rem; width: 80px;" onclick="app.manageBarberTrial(${b.id})"><i class="fa-solid fa-clock"></i> التجربة</button>`;
        const deleteBtn = `<button class="btn btn-ghost text-danger p-1 ml-2" style="font-size: 1rem;" onclick="app.deleteBarber(${b.id})"><i class="fa-solid fa-trash"></i></button>`;
        const alertBtn = `<button class="btn text-warning p-1" style="font-size: 1rem;" onclick="app.sendSubscriptionAlert('${b.name}')"><i class="fa-solid fa-bell"></i></button>`;
        const pdfBtn = `<button class="btn text-info p-1 ml-2" style="font-size: 1rem;" onclick="app.downloadFinancialReport(${b.id}, '${b.name}')"><i class="fa-solid fa-file-pdf"></i></button>`;

        return `
                <div class="pill-box p-3 mb-3 d-flex flex-column" style="border-right: 3px solid ${isBlocked ? '#e74c3c' : 'var(--gold-primary)'};">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${b.image}" width="45" height="45" loading="lazy" decoding="async" style="border-radius: 50%; border: 1px solid var(--border-color); object-fit: cover;">
                            <div class="text-right">
                                <div style="font-weight: bold; color: #fff; font-size: 0.95rem;">${b.name}</div>
                                <div class="mt-1">${subBadge} <span class="text-muted" style="font-size: 0.75rem;"><i class="fa-solid fa-phone"></i> ${b.phone}</span></div>
                            </div>
                        </div>
                        <div>
                            ${pdfBtn}
                            ${alertBtn}
                            ${deleteBtn}
                        </div>
                    </div>
                    <div class="d-flex justify-content-end mt-2" style="gap: 5px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                        ${trialBtn}
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
                <div class="tabs-container mb-4" style="overflow-x: auto; white-space: nowrap; gap: 10px; border-bottom: none; padding-bottom: 10px;">
                    <button class="btn btn-ghost admin-tab-item active" id="admin-tab-1" onclick="app.switchAdminTab(1)"><i class="fa-solid fa-chart-pie"></i> نظرة عامة</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-5" onclick="app.switchAdminTab(5)"><i class="fa-solid fa-file-invoice-dollar"></i> التفعيل</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-2" onclick="app.switchAdminTab(2)"><i class="fa-solid fa-money-bill-wave"></i> تحصيل الأرباح</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-3" onclick="app.switchAdminTab(3)"><i class="fa-solid fa-tags"></i> الاشتراكات</button>
                    <button class="btn btn-ghost admin-tab-item" id="admin-tab-4" onclick="app.switchAdminTab(4)"><i class="fa-solid fa-users-gear"></i> الصالونات</button>
                </div>
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
                    <div class="pill-box mb-4 text-right">
                        <h4 class="text-gold mb-3"><i class="fa-solid fa-trophy"></i> الصالونات الأكثر أداءً</h4>
                        <p class="text-muted mb-3" style="font-size: 0.8rem;">بناءً على عدد الحجوزات الشهرية</p>
                        ${barbers.slice(0, 3).map((b, i) => `
                            <div class="d-flex justify-content-between align-items-center mb-2 pb-2" style="border-bottom: 1px solid var(--border-color);">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="text-gold" style="font-weight: bold; width: 20px;">#${i + 1}</div>
                                    <img src="${b.image}" width="30" height="30" loading="lazy" decoding="async" style="border-radius: 50%; object-fit: cover;">
                                    <span class="text-white" style="font-size: 0.9rem;">${b.name}</span>
                                </div>
                                <div class="text-success" style="font-size: 0.85rem;"><i class="fa-solid fa-calendar-check"></i> ${Math.floor(Math.random() * 100) + 20} حجز</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pill-box mb-4 text-right">
                        <h4 class="text-white mb-3"><i class="fa-solid fa-clock-rotate-left text-gold"></i> سجل نشاطات الحلاقين</h4>
                        <div class="activity-log-item mb-2 pb-2 text-right" style="border-bottom: 1px solid var(--border-color);">
                            <div class="text-white" style="font-size: 0.85rem;"><i class="fa-solid fa-right-to-bracket text-muted"></i> صالون المقص الذهبي قام بتسجيل الدخول</div>
                            <div class="text-muted" style="font-size: 0.7rem;">منذ 5 دقائق</div>
                        </div>
                        <div class="activity-log-item mb-2 pb-2 text-right" style="border-bottom: 1px solid var(--border-color);">
                            <div class="text-white" style="font-size: 0.85rem;"><i class="fa-solid fa-tag text-info"></i> صالون الشباب قام بتعديل تسعيرة "تنظيف البشرة"</div>
                            <div class="text-muted" style="font-size: 0.7rem;">منذ 15 دقيقة</div>
                        </div>
                        <div class="activity-log-item text-right">
                            <div class="text-white" style="font-size: 0.85rem;"><i class="fa-solid fa-trash text-danger"></i> صالون الأناقة قام بحذف حجز العميل (أحمد)</div>
                            <div class="text-muted" style="font-size: 0.7rem;">منذ 40 دقيقة</div>
                        </div>
                    </div>
                    <div class="pill-box mb-4 text-right">
                        <h4 class="text-gold mb-3"><i class="fa-solid fa-map-location-dot"></i> خريطة النشاط (توزع الصالونات)</h4>
                        <div class="d-flex flex-column gap-3">
                            <div>
                                <div class="d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
                                    <span class="text-white">عَمّان</span>
                                    <span class="text-gold">65%</span>
                                </div>
                                <div style="width: 100%; background: #222; border-radius: 4px; height: 8px; overflow: hidden;"><div style="width: 65%; background: var(--gold-primary); height: 100%;"></div></div>
                            </div>
                            <div>
                                <div class="d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
                                    <span class="text-white">إربد</span>
                                    <span class="text-gold">20%</span>
                                </div>
                                <div style="width: 100%; background: #222; border-radius: 4px; height: 8px; overflow: hidden;"><div style="width: 20%; background: var(--gold-primary); height: 100%;"></div></div>
                            </div>
                            <div>
                                <div class="d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
                                    <span class="text-white">الزرقاء</span>
                                    <span class="text-gold">10%</span>
                                </div>
                                <div style="width: 100%; background: #222; border-radius: 4px; height: 8px; overflow: hidden;"><div style="width: 10%; background: var(--gold-primary); height: 100%;"></div></div>
                            </div>
                            <div>
                                <div class="d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
                                    <span class="text-white">باقي المحافظات</span>
                                    <span class="text-gold">5%</span>
                                </div>
                                <div style="width: 100%; background: #222; border-radius: 4px; height: 8px; overflow: hidden;"><div style="width: 5%; background: var(--gold-primary); height: 100%;"></div></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="text-gold text-right mb-3">تذاكر الدعم الفني</h3>
                    <div class="mb-4">${supportRows}</div>
                </div>
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
                        <h4 class="text-gold mb-2"><i class="fa-solid fa-robot"></i> أداة التنبيه الآلي (WhatsApp API)</h4>
                        <p class="text-white mb-3" style="font-size: 0.85rem; line-height: 1.5;">النظام يقوم حالياً بإرسال رسائل WhatsApp وتنبيهات داخلية للحلاقين قبل 3 أيام من انتهاء اشتراكهم بشكل آلي بالكامل.</p>
                        <div class="d-flex justify-content-between text-center mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
                            <div>
                                <div class="text-gold" style="font-size: 1.2rem; font-weight: bold;">842</div>
                                <div class="text-muted" style="font-size: 0.7rem;">تم الإرسال</div>
                            </div>
                            <div style="width: 1px; background: var(--border-color);"></div>
                            <div>
                                <div class="text-success" style="font-size: 1.2rem; font-weight: bold;">98%</div>
                                <div class="text-muted" style="font-size: 0.7rem;">نسبة النجاح</div>
                            </div>
                            <div style="width: 1px; background: var(--border-color);"></div>
                            <div>
                                <div class="text-danger" style="font-size: 1.2rem; font-weight: bold;">14</div>
                                <div class="text-muted" style="font-size: 0.7rem;">فشل</div>
                            </div>
                        </div>
                        <div class="text-success mt-3 text-center" style="font-size: 0.85rem;"><i class="fa-solid fa-circle-check"></i> الخوادم متصلة بالواتساب بنجاح</div>
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
};
