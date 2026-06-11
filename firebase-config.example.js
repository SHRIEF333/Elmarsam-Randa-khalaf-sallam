// ⚠️ تعليمات الإعداد:
// 1. اذهب إلى: https://console.firebase.google.com
// 2. أنشئ مشروع جديد (تسميه "elmarsam" مثلاً)
// 3. نشّط Realtime Database (اختر "Start in test mode")
// 4. انسخ قيم الإعدادات من "Project Settings" 
// 5. أعد تسمية هذا الملف من firebase-config.example.js إلى firebase-config.js
// 6. املأ البيانات أدناه:

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                           // من Firebase Settings
    authDomain: "your-project.firebaseapp.com",       // من Firebase Settings
    databaseURL: "https://your-project.firebaseio.com", // من Realtime Database URL
    projectId: "your-project",                        // معرف المشروع
    storageBucket: "your-project.appspot.com",        // Storage bucket
    messagingSenderId: "YOUR_SENDER_ID",              // من Firebase Settings
    appId: "YOUR_APP_ID"                              // من Firebase Settings
};

// مثال على البيانات الصحيحة (بعد الإعداد):
/*
const firebaseConfig = {
    apiKey: "AIzaSyDnJb3qLz_L8kJ_Z-9PqK_L0mN1oP2qR",
    authDomain: "elmarsam.firebaseapp.com",
    databaseURL: "https://elmarsam.firebaseio.com",
    projectId: "elmarsam",
    storageBucket: "elmarsam.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};
*/

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log('✅ Firebase مهيأ بنجاح');
