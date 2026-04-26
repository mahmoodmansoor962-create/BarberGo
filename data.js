// Mock Database for BarberGo MVP
const db = {
    users: [
        { id: 1, name: 'أحمد محمود', type: 'client', createdAt: '2026-04-01' },
        { id: 2, name: 'محمد صالون', type: 'barber', createdAt: '2026-03-15' },
        { id: 100, name: 'المدير العام', type: 'admin', createdAt: '2026-01-01' }
    ],
    barbers: [
        {
            id: 1,
            name: 'صالون الأناقة (محمد)',
            image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            bio: 'خبرة أكثر من 10 سنوات في أحدث قصات الشعر الكلاسيكية والحديثة. نهتم بالتفاصيل لضمان إطلالتك الأفضل.',
            location: 'عمان، عبدون',
            phone: '079XXXXXXX',
            subscriptionStatus: 'active',
            subscriptionEndDate: '2026-12-31',
            homeService: true,
            rating: 4.8,
            reviewsCount: 124,
            settings: { 
                enableEmergency: true, 
                enableHomeService: false, 
                slotDurationMinutes: 30,
                workingHours: '10:00 ص - 10:00 م'
            },
            paymentMethods: {
                cliq: 'MHAMMAD23',
                visa: true,
                wallet: '079XXXXXXX'
            }
        },
        {
            id: 2,
            name: 'قصّات النخبة (علي)',
            image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            bio: 'متخصص في العناية بالبشرة واللحية، وقصات الـ Fade باحترافية عالية.',
            location: 'عمان، الجبيهة',
            phone: '078XXXXXXX',
            subscriptionStatus: 'trial',
            subscriptionEndDate: '2026-10-15',
            homeService: false,
            rating: 4.9,
            reviewsCount: 89,
            settings: { enableEmergency: false, enableHomeService: false, slotDurationMinutes: 20, workingHours: '09:00 ص - 09:00 م' }
        },
        {
            id: 3,
            name: 'كلاسيك باربر (سامر)',
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            bio: 'صالون يستلهم روح الماضي بلمسة عصرية. نحن نقدم تجربة حلاقة لا تُنسى.',
            location: 'إربد، شارع الجامعة',
            phone: '077XXXXXXX',
            subscriptionStatus: 'active',
            subscriptionEndDate: '2026-08-22',
            homeService: true,
            rating: 4.6,
            reviewsCount: 201,
            settings: { enableEmergency: true, enableHomeService: true, slotDurationMinutes: 45, workingHours: '11:00 ص - 11:00 م' }
        },
        {
            id: 4,
            name: 'ستايل عصري (خالد)',
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            bio: 'أحدث القصات الشبابية، ومختص بالصبغات المعقدة وسحب اللون.',
            location: 'الزرقاء، الوسط التجاري',
            phone: '079XXXXXXX',
            subscriptionStatus: 'trial-expired',
            subscriptionEndDate: '2026-04-10',
            homeService: false,
            rating: 4.5,
            reviewsCount: 65,
            settings: { enableEmergency: false, enableHomeService: false, slotDurationMinutes: 30, workingHours: '10:00 ص - 08:00 م' }
        }
    ],
    services: [
        { id: 1, barber_id: 1, name: 'قص شعر وتدريج (Fade)', price: 10, duration: 30 },
        { id: 2, barber_id: 1, name: 'حلاقة لحية مع بخار', price: 5, duration: 20 },
        { id: 3, barber_id: 1, name: 'تنظيف بشرة ملكي', price: 15, duration: 45 },
        { id: 4, barber_id: 2, name: 'قص شعر كلاسيكي', price: 8, duration: 30 },
        { id: 5, barber_id: 2, name: 'تحديد لحية', price: 4, duration: 15 },
        { id: 6, barber_id: 3, name: 'الرزمة الشاملة (عريس)', price: 50, duration: 120 }
    ],
    products: [
        { id: 1, barber_id: 1, name: 'جل شعر قوي الثبات', price: 12, image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { id: 2, barber_id: 1, name: 'زيت اللحية الطبيعي', price: 15, image: 'https://images.unsplash.com/photo-1580870059815-dc34d4511d73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
    ],
    bookings: [
        { id: 1, barber_id: 1, customer_name: 'أحمد محمود', date: '2026-04-12', time: '14:30', status: 'confirmed' },
        { id: 2, barber_id: 1, customer_name: 'عمر خالد', date: '2026-04-12', time: '15:00', status: 'pending' },
        { id: 3, barber_id: 2, customer_name: 'يزن حسن', date: '2026-04-13', time: '10:00', status: 'confirmed' }
    ],
    supportTickets: [
        { id: 1, sender: 'أحمد محمود', type: 'client', message: 'موقعي لا يظهر بشكل صحيح على الخريطة', status: 'open' },
        { id: 2, sender: 'كلاسيك باربر', type: 'barber', message: 'أريد ترقية الباقة لسنوية', status: 'closed' }
    ],
    adminSettings: {
        platformRevenue: 1250, // in JOD
        monthlyGrowth: {
            labels: ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'],
            data: [15, 22, 35, 48, 62, 85]
        },
        subscriptionPrices: {
            monthly: 20,
            yearly: 200
        },
        payoutDetails: {
            cliq: 'BARBERGO',
            bankIban: 'JO98 ABAB 0000 0000 0000 00',
            bankName: 'البنك العربي',
            accountHolder: 'المدير العام',
            wallet: '079XXXXXXX'
        }
    }
};

// Expose to window for global access
window.db = db;
