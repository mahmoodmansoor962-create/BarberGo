(async function () {
  'use strict';

  let initializeApp, initializeFirestore, enableIndexedDbPersistence,
      collection, query, where, getDocs, onSnapshot, addDoc, updateDoc,
      deleteDoc, doc, serverTimestamp, arrayRemove,
      getAuth, signInAnonymously, setPersistence, browserLocalPersistence;

  try {
    ({ initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'));
    ({ initializeFirestore, enableIndexedDbPersistence, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));
    ({ getAuth, signInAnonymously, setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'));
  } catch (sdkErr) {
    console.error('Firebase SDK failed to load', sdkErr);
    return;
  }

  class DatabaseService {
    constructor() {
      this.useRealFirebase = true;
      this.db = null;
      this.auth = null;
      this.customerUid = null;
      this.authReady = Promise.resolve();
      this.activeSnapshotListeners = new Map();

      // [مهم]: استبدل البيانات التالية ببيانات مشروعك الحقيقية
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "YOUR_ID",
        appId: "YOUR_APP_ID"
      };

      try {
        const app = initializeApp(firebaseConfig);
        this.db = initializeFirestore(app, { localCache: true });
        this.auth = getAuth(app);
        this.authReady = this._initializeAnonymousAuth();
        console.info('Firebase initialized successfully.');
      } catch (error) {
        console.error('Firebase initialization failed', error);
      }
    }

    async _initializeAnonymousAuth() {
      try {
        await setPersistence(this.auth, browserLocalPersistence);
        const result = await signInAnonymously(this.auth);
        this.customerUid = result.user.uid;
        return this.customerUid;
      } catch (error) {
        console.error('Auth failed', error);
      }
    }

    getCustomerUid() { return this.customerUid; }

    async ensureAuthReady() {
      await this.authReady;
      return this.getCustomerUid();
    }

    // دالة جلب المواعيد من Firestore
    subscribeToBookings(barberId, callback) {
      const bookingsQuery = query(collection(this.db, 'bookings'), where('barber_id', '==', barberId));
      return onSnapshot(bookingsQuery, snapshot => {
        const changes = snapshot.docChanges().map(change => ({
          type: change.type,
          data: { id: change.doc.id, ...change.doc.data() }
        }));
        callback(changes);
      });
    }

    // دالة حجز موعد جديد في Firestore
    async bookAppointment(data) {
      await this.ensureAuthReady();
      const docRef = await addDoc(collection(this.db, 'bookings'), {
        ...data,
        customer_uid: this.getCustomerUid(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    }
  }

  window.dbService = new DatabaseService();
})();
