// BarberGo - Real-time Firebase Configuration & Service
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // رح نحدث هدول بس تربط حسابك الفعلي
    authDomain: "barber-go-zeta.firebaseapp.com",
    projectId: "barber-go-zeta",
    storageBucket: "barber-go-zeta.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// تشغيل Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// تفعيل ميزة البقاء قيد تسجيل الدخول (Persistent Login)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// --- وظيفة الدخول عبر جوجل ---
async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        console.log("تم الدخول بنجاح:", result.user.displayName);
        handleUserRedirect(result.user);
    } catch (error) {
        console.error("خطأ في تسجيل دخول جوجل:", error.message);
        alert("حدث خطأ أثناء الاتصال بجوجل");
    }
}

// --- توجيه المستخدم (مدير/حلاق/عميل) ---
function handleUserRedirect(user) {
    if (!user) return;
    
    // إيميل المدير الخاص بك
    if (user.email === "admin@barbergo.com") {
        window.location.href = "admin.html";
    } else {
        // أي مستخدم آخر يذهب للصفحة الرئيسية (وسيتم تفعيل إعدادات الحلاق له لاحقاً)
        window.location.href = "index.html";
    }
}

// --- مراقبة حالة المستخدم (عشان ما يطلب دخول كل مرة) ---
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("مرحباً بعودتك:", user.email);
        // إذا كان المستخدم في صفحة الدخول، يتم توجيهه تلقائياً
        if (window.location.pathname.includes("login") || window.location.pathname === "/") {
            // سنضيف هنا كود التحقق من نوع الحساب لاحقاً
        }
    }
});

// تصدير الخدمة للاستخدام في app.js
const db = firebase.firestore();
const auth = firebase.auth();
