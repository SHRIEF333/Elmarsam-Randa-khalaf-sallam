// ⚙️ إعدادات Supabase
// ملاحظة: هذا ملف عام - للأمان الكامل، استخدم متغيرات البيئة

const SUPABASE_CONFIG = {
    URL: 'https://YOUR_PROJECT_URL.supabase.co', // استبدل هنا
    ANON_KEY: 'YOUR_ANON_PUBLIC_KEY', // استبدل هنا
};

// إنشاء Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

console.log('✅ Supabase initialized');
