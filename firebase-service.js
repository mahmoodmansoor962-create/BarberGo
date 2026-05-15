// Production Real-time Database Architecture (Firebase/Supabase Ready)

class DatabaseService {
    constructor() {
        // To use REAL Firebase, initialize here with your config
        this.useRealFirebase = false;
        this.db = null;
        this.auth = null;
        this.mockListeners = new Map(); // barberId => Map(listenerId => callback)

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
            this.auth = firebase.auth();
        } else {
            console.warn("DB_SERVICE: Running in Mock Mode. Enable useRealFirebase when ready.");
        }
    }

    // Connect WebSockets or Real-time Listeners
    subscribeToBookings(barberId, callback) {
        if (this.useRealFirebase) {
            // Real-time Firestore Socket Listener
            return this.db.collection("bookings")
                .where("barber_id", "==", barberId)
                .onSnapshot((snapshot) => {
                    const changes = snapshot.docChanges().map(change => ({
                        type: change.type,
                        data: { id: change.doc.id, ...change.doc.data() }
                    }));
                    callback(changes);
                });
        } else {
            // Mock Socket Subscription logic (per-subscriber, with unsubscribe)
            return this._mockAddBookingListener(barberId, callback);
        }
    }

    async bookAppointment(data) {
        if (this.useRealFirebase) {
            return await this.db.collection("bookings").add({
                ...data,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Mock saving to DB
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Saving booking to Persistent DB:", data);
                    const newBooking = { id: Date.now(), status: 'pending', ...data };

                    if (window.db) {
                        window.db.bookings.push(newBooking);
                        if (window.saveDB) window.saveDB();
                    }

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
