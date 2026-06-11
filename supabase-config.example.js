// Supabase Configuration (Example)
// استبدل البيانات بـ بيانات مشروعك

const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';  // مثل: https://xxxx.supabase.co
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';  // المفتاح العام

// تهيئة Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase مهيأ بنجاح');
