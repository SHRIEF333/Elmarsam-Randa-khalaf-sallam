// Supabase Configuration
const supabaseUrl = 'https://uorkphjfmagixrwjmpbv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcmtwaGpmbWFnaXhyd2ptcGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjczMzcsImV4cCI6MjA5NjcwMzMzN30.jZ_iOlKfEtZ83KAH26ZV6HSyQcoFHfJCjvPfYpUNxxI';

// تهيئة Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase مهيأ بنجاح');
