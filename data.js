// Real-Time Database Manager using LocalStorage (Persistent State)
const defaultDB = {
    users: [],
    barbers: [], // Start with 0 barbers (Real mode)
    services: [],
    products: [],
    bookings: [],
    notifications: [],
    supportTickets: [],
    adminSettings: {
        platformRevenue: 0,
        monthlyGrowth: {
            labels: ['الشهر 1', 'الشهر 2', 'الشهر 3'],
            data: [0, 0, 0]
        },
        subscriptionPrices: {
            monthly: 20,
            yearly: 200
        },
        payoutDetails: {
            cliq: 'BARBERGO',
            bankIban: 'JO98 ABAB 0000 0000 0000 00',
            bankName: 'اسم البنك',
            accountHolder: 'المدير العام',
            wallet: '079XXXXXXX'
        }
    }
};

// Auto-Load from LocalStorage or use Default
const savedData = localStorage.getItem('barbergo_db');
const db = savedData ? JSON.parse(savedData) : defaultDB;

// Helper function to persist changes globally
window.saveDB = async function () {
    localStorage.setItem('barbergo_db', JSON.stringify(db));
    
    // Simulate Firestore syncing if real keys are not provided yet,
    // or actually save if useRealFirebase is enabled in firebase-service.js
    if (window.dbService && window.dbService.useRealFirebase && window.dbService.db) {
        try {
            // In a real app we'd break this down into specific documents
            await window.dbService.db.collection('system').doc('state').set(db);
            console.log('✅ Database changes successfully synced to Firestore!');
        } catch (error) {
            console.error('❌ Error syncing to Firestore (Check your Rules or Config):', error);
        }
    } else {
        console.log('✅ Database changes saved to LocalStorage (Firestore mock active)');
    }
};

// Ensure the global DB object always has required arrays
window.db = window.db || db;
window.db.users = window.db.users || [];
window.db.barbers = window.db.barbers || [];
window.db.services = window.db.services || [];
window.db.products = window.db.products || [];
window.db.bookings = window.db.bookings || [];
window.db.notifications = window.db.notifications || [];
window.db.supportTickets = window.db.supportTickets || [];
window.db.adminSettings = window.db.adminSettings || defaultDB.adminSettings;

// Expose to window for global access
window.db = db;
