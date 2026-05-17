// Production Real-time Database Architecture (Firebase/Supabase Ready)

class DatabaseService {
    constructor() {
        // To use REAL Firebase, initialize here with your config
        // Warning: set to true only after you add your Firebase SDK and config below.
        // When enabled and `window.firebase` is available the service will initialize.
        this.useRealFirebase = true;
        this.db = null;
        this.auth = null;
        this.customerUid = null;
        this.mockListeners = new Map(); // barberId => Map(listenerId => callback)
        this.feedbackTimers = new Map();
        this.activeSnapshotListeners = new Map();
        this.authReady = Promise.resolve();

        if (this.useRealFirebase && window.firebase) {
            const firebaseConfig = {
                apiKey: "YOUR_API_KEY",
                authDomain: "your-app.firebaseapp.com",
                projectId: "your-project-id",
                storageBucket: "your-app.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef"
            };
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this._enableFirestorePersistence();
            this.auth = firebase.auth();
            this.authReady = this._initializeAnonymousAuth();
        } else {
            console.warn("DB_SERVICE: Running in Mock Mode. Enable useRealFirebase when ready.");
            this._ensureLocalCustomerUid();
        }
    }

    async _initializeAnonymousAuth() {
        let resolved = false;
        return new Promise((resolve) => {
            const finish = (uid) => {
                if (resolved) return;
                resolved = true;
                this.customerUid = uid;
                localStorage.setItem('barbergo_customer_uid', uid);
                if (!localStorage.getItem('barbergo_session')) {
                    localStorage.setItem('barbergo_session', 'client');
                }
                resolve(uid);
            };

            if (!this.auth) {
                finish(this._ensureLocalCustomerUid());
                return;
            }

            this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
                console.warn('Unable to set Firebase auth persistence:', err);
            });

            this.auth.onAuthStateChanged(async (user) => {
                if (user && user.uid) {
                    finish(user.uid);
                    return;
                }

                try {
                    const result = await this.auth.signInAnonymously();
                    if (result && result.user && result.user.uid) {
                        finish(result.user.uid);
                    } else {
                        finish(this._ensureLocalCustomerUid());
                    }
                } catch (error) {
                    console.error('Firebase anonymous sign-in failed:', error);
                    finish(this._ensureLocalCustomerUid());
                }
            });
        });
    }

    _ensureLocalCustomerUid() {
        let uid = localStorage.getItem('barbergo_customer_uid');
        if (!uid) {
            uid = `local_${Math.random().toString(36).slice(2)}_${Date.now()}`;
            localStorage.setItem('barbergo_customer_uid', uid);
        }
        this.customerUid = uid;
        if (!localStorage.getItem('barbergo_session')) {
            localStorage.setItem('barbergo_session', 'client');
        }
        return uid;
    }

    getCustomerUid() {
        return this.customerUid || this._ensureLocalCustomerUid();
    }

    async ensureAuthReady() {
        await this.authReady;
        return this.getCustomerUid();
    }

    _enableFirestorePersistence() {
        if (!this.db || !firebase || !firebase.firestore) return;
        this.db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.info('Firestore persistence enabled.');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Firestore persistence disabled because multiple tabs are open.');
                } else if (err.code === 'unimplemented') {
                    console.warn('Firestore persistence is not supported by this browser.');
                } else {
                    console.warn('Firestore persistence error:', err);
                }
            });
    }

    // Connect WebSockets or Real-time Listeners
    subscribeToBookings(barberId, callback) {
        if (this.useRealFirebase) {
            const listenerKey = `bookings_${barberId}`;
            const existing = this.activeSnapshotListeners.get(listenerKey);
            if (existing) {
                existing.callbacks.add(callback);
                return () => this.unsubscribeBookingListener(barberId, callback);
            }

            const callbacks = new Set([callback]);
            const unsubscribe = this.db.collection("bookings")
                .where("barber_id", "==", barberId)
                .onSnapshot((snapshot) => {
                    const changes = snapshot.docChanges().map(change => ({
                        type: change.type,
                        data: { id: change.doc.id, ...change.doc.data() }
                    }));
                    callbacks.forEach(cb => cb(changes));
                }, (error) => {
                    console.error('Firestore listener error:', error);
                });

            this.activeSnapshotListeners.set(listenerKey, { unsubscribe, callbacks });
            return () => this.unsubscribeBookingListener(barberId, callback);
        } else {
            return this._mockAddBookingListener(barberId, callback);
        }
    }

    unsubscribeBookingListener(barberId, callback) {
        const listenerKey = `bookings_${barberId}`;
        const entry = this.activeSnapshotListeners.get(listenerKey);
        if (!entry) return;

        entry.callbacks.delete(callback);
        if (entry.callbacks.size === 0) {
            entry.unsubscribe();
            this.activeSnapshotListeners.delete(listenerKey);
        }
    }

    async bookAppointment(data) {
        await this.ensureAuthReady();
        const barber = window.db && window.db.barbers ? window.db.barbers.find(b => b.id === data.barber_id || b.id.toString() === data.barber_id.toString()) : null;
        const barberUid = barber ? (barber.uid || barber.barber_uid || null) : null;
        if (this.useRealFirebase) {
            const docRef = await this.db.collection("bookings").add({
                ...data,
                customer_uid: this.getCustomerUid(),
                barber_uid: barberUid,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const newBooking = { id: docRef.id, status: 'pending', ...data };
            newBooking.customer_uid = this.getCustomerUid();
            if (barberUid) newBooking.barber_uid = barberUid;
            if (window.db) {
                window.db.bookings = window.db.bookings || [];
                window.db.bookings.push(newBooking);
                if (window.saveDB) window.saveDB();
            }
            this.scheduleFeedbackNotificationForBooking(newBooking);
            return newBooking;
        } else {
            // Mock saving to DB
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Saving booking to Persistent DB:", data);
                    const newBooking = { id: Date.now(), status: 'pending', ...data, customer_uid: this.getCustomerUid() };
                    if (barberUid) newBooking.barber_uid = barberUid;

                    if (window.db) {
                        window.db.bookings.push(newBooking);
                        if (window.saveDB) window.saveDB();
                    }

                    this.scheduleFeedbackNotificationForBooking(newBooking);

                    // Trigger mock listeners for this barberId (if any)
                    try {
                        const barberListeners = this.mockListeners.get(newBooking.barber_id);
                        if (barberListeners && barberListeners.size > 0) {
                            const changes = [{ type: 'added', data: newBooking }];
                            barberListeners.forEach(cb => {
                                try { cb(changes); } catch (err) { console.error('mock listener error', err); }
                            });
                        }
                    } catch (err) {
                        console.error('Error delivering mock listeners:', err);
                    }

                    resolve(newBooking);
                }, 500);
            });
        }
    }

    async saveCustomerNotification(notification) {
        if (this.useRealFirebase && this.db) {
            const docRef = await this.db.collection('notifications').add(notification);
            return { id: docRef.id, ...notification };
        }

        window.db.notifications = window.db.notifications || [];
        window.db.notifications.push(notification);
        window.saveDB();
        return notification;
    }

    async addBarberRating(barberId, ratingData) {
        const barber = window.db.barbers.find(b => b.id === barberId);
        if (barber) {
            if (!barber.ratings) barber.ratings = [];
            barber.ratings.unshift(ratingData);
            window.saveDB();
        }

        if (this.useRealFirebase && this.db) {
            await this.db.collection('barbers').doc(barberId.toString()).collection('ratings').add(ratingData);
        }

        return ratingData;
    }

    _parseBookingTime(timeStr) {
        if (!timeStr) return null;
        const parts = timeStr.trim().split(' ');
        const marker = parts.pop() || '';
        const timePart = parts.join(' ').replace(/\u200F/g, '').trim();
        const [hourText, minuteText = '0'] = timePart.split(':');
        let hour = parseInt(hourText, 10);
        const minute = parseInt(minuteText, 10) || 0;

        const lower = marker.replace(/\./g, '').toLowerCase();
        const isPM = lower.includes('م') || lower.includes('pm');
        const isAM = lower.includes('ص') || lower.includes('am');

        if (isPM && hour < 12) hour += 12;
        if (isAM && hour === 12) hour = 0;
        return { hour, minute };
    }

    _getBookingStartDate(booking) {
        if (!booking) return null;
        const baseDate = booking.date ? new Date(booking.date) : new Date();
        if (isNaN(baseDate.getTime())) return null;
        const timeObj = this._parseBookingTime(booking.time);
        if (!timeObj) return null;

        const startDate = new Date(baseDate);
        startDate.setHours(timeObj.hour, timeObj.minute, 0, 0);
        return startDate;
    }

    async createFeedbackNotificationForBooking(booking) {
        if (!booking || booking.feedbackNotificationCreated || booking.status === 'cancelled') return;

        const barber = window.db.barbers.find(b => b.id === booking.barber_id) || {};
        const notification = {
            id: Date.now(),
            type: 'feedback_request',
            booking_id: booking.id,
            customerName: booking.customer_name,
            barberId: booking.barber_id,
            barberName: barber.name || 'الحلاق',
            message: `أهلاً بك سيد ${booking.customer_name}، نعيماً لزيارتك اليوم. يهم كابتن ${barber.name || 'الحلاق'} الاطمئنان على تجربتك الشخصية معنا؛ كيف وجدت مستوى الخدمة والأداء؟ إذا كنت ترغب في مشاركتنا رأيك (اختياري)، يمكنك وضع تقييمك للخدمة من 100% لمساعدتنا في تقديم الأفضل لك دائماً.`,
            createdAt: new Date().toISOString(),
            archived: false,
            submitted: false,
            ratingPercentage: null
        };

        await this.saveCustomerNotification(notification);
        booking.feedbackNotificationCreated = true;
        window.saveDB();

        if (localStorage.getItem('barbergo_client_name') === booking.customer_name && window.notifier) {
            window.notifier.show("تقييم اختياري", `لقد أصبح تقييمك بعد زيارة ${notification.barberName} متاحاً الآن.`, "info");
        }
    }

    // Service management helpers
    async updateService(serviceId, updates) {
        if (this.useRealFirebase && this.db) {
            try {
                await this.db.collection('services').doc(serviceId.toString()).update(updates);
            } catch (err) {
                console.error('Firestore updateService error', err);
                throw err;
            }
        } else {
            const svc = window.db.services.find(s => s.id === serviceId || s.id.toString() === serviceId.toString());
            if (svc) {
                Object.assign(svc, updates);
                window.saveDB && window.saveDB();
            }
        }
        return true;
    }

    async deleteService(serviceId) {
        if (this.useRealFirebase && this.db) {
            try {
                await this.db.collection('services').doc(serviceId.toString()).delete();
            } catch (err) {
                console.error('Firestore deleteService error', err);
                throw err;
            }
        } else {
            window.db.services = window.db.services.filter(s => !(s.id === serviceId || s.id.toString() === serviceId.toString()));
            window.saveDB && window.saveDB();
        }
        return true;
    }

    // Remove a service object from the barber document's services array using arrayRemove
    async removeServiceFromBarber(barberId, serviceObj) {
        if (this.useRealFirebase && this.db) {
            try {
                await this.db.collection('barbers').doc(barberId.toString()).update({
                    services: firebase.firestore.FieldValue.arrayRemove(serviceObj)
                });
            } catch (err) {
                console.error('Firestore removeServiceFromBarber error', err);
                throw err;
            }
        } else {
            // mock: remove from global services list and barber.services array
            window.db.services = window.db.services.filter(s => !(s.id === serviceObj.id && s.barber_id === barberId));
            const barber = window.db.barbers.find(b => b.id === barberId || b.id.toString() === barberId.toString());
            if (barber && Array.isArray(barber.services)) {
                barber.services = barber.services.filter(s => !(s.id === serviceObj.id));
            }
            window.saveDB && window.saveDB();
        }
        return true;
    }

    scheduleFeedbackNotificationForBooking(booking) {
        if (!booking || booking.feedbackNotificationCreated || booking.status === 'cancelled') return;

        const service = window.db.services.find(s => s.id === booking.service_id);
        const durationMinutes = service && !isNaN(parseInt(service.duration, 10)) ? parseInt(service.duration, 10) : 60;
        const startDate = this._getBookingStartDate(booking);
        if (!startDate) return;

        const dueTime = startDate.getTime() + ((durationMinutes + 60) * 60 * 1000);
        const msUntil = dueTime - Date.now();

        if (msUntil <= 0) {
            this.createFeedbackNotificationForBooking(booking);
            return;
        }

        if (this.feedbackTimers.has(booking.id)) {
            clearTimeout(this.feedbackTimers.get(booking.id));
        }

        const delay = Math.min(msUntil, 2147483647);
        const timer = setTimeout(() => {
            this.createFeedbackNotificationForBooking(booking);
            this.feedbackTimers.delete(booking.id);
        }, delay);

        this.feedbackTimers.set(booking.id, timer);
    }

    scheduleFeedbackNotifications() {
        if (!window.db || !Array.isArray(window.db.bookings)) return;
        window.db.bookings.forEach(booking => this.scheduleFeedbackNotificationForBooking(booking));
    }

    initFeedbackScheduler() {
        this.scheduleFeedbackNotifications();
        setInterval(() => this.scheduleFeedbackNotifications(), 5 * 60 * 1000);
    }

    // ============================================
    // Mock WebSocket Utilities (For Development)
    // ============================================
    _mockAddBookingListener(barberId, callback) {
        // Ensure map for this barberId
        if (!this.mockListeners.has(barberId)) {
            this.mockListeners.set(barberId, new Map());
        }
        const listenersMap = this.mockListeners.get(barberId);
        const listenerId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        listenersMap.set(listenerId, callback);

        // Return unsubscribe function
        const unsubscribe = () => {
            const map = this.mockListeners.get(barberId);
            if (map) {
                map.delete(listenerId);
                if (map.size === 0) this.mockListeners.delete(barberId);
            }
        };

        return unsubscribe;
    }
}

window.dbService = new DatabaseService();
