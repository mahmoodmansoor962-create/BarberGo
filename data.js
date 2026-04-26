// Real-Time Database Manager using LocalStorage (Persistent State)
const defaultDB = {
    users: [],
    barbers: [], // Start with 0 barbers (Real mode)
    services: [],
    products: [],
    bookings: [],
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
window.saveDB = function () {
    localStorage.setItem('barbergo_db', JSON.stringify(db));
    console.log('Database changes saved to LocalStorage');
};

// Expose to window for global access
window.db = db;
