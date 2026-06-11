// 🌐 خدمات Supabase
class SupabaseService {
    constructor(supabaseClient) {
        this.client = supabaseClient;
    }

    // ➕ إضافة حجز جديد
    async addBooking(booking) {
        try {
            const { data, error } = await this.client
                .from('bookings')
                .insert([{
                    person_name: booking.personName,
                    course_name: booking.courseName,
                    amount: booking.amount,
                    booking_date: booking.bookingDate,
                    notes: booking.notes || '',
                    payment_status: booking.paymentStatus || 'completed'
                }])
                .select();

            if (error) throw error;
            console.log('✅ تم إضافة الحجز إلى Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ خطأ في إضافة الحجز:', error.message);
            throw error;
        }
    }

    // 📥 جلب جميع الحجوزات
    async getBookings() {
        try {
            const { data, error } = await this.client
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('✅ تم جلب الحجوزات من Supabase');
            return data || [];
        } catch (error) {
            console.error('❌ خطأ في جلب الحجوزات:', error.message);
            return [];
        }
    }

    // ✏️ تحديث حجز
    async updateBooking(id, updatedData) {
        try {
            const { data, error } = await this.client
                .from('bookings')
                .update({
                    person_name: updatedData.personName,
                    course_name: updatedData.courseName,
                    amount: updatedData.amount,
                    booking_date: updatedData.bookingDate,
                    notes: updatedData.notes || '',
                    payment_status: updatedData.paymentStatus || 'completed'
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            console.log('✅ تم تحديث الحجز في Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ خطأ في تحديث الحجز:', error.message);
            throw error;
        }
    }

    // 🗑️ حذف حجز
    async deleteBooking(id) {
        try {
            const { error } = await this.client
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ تم حذف الحجز من Supabase');
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف الحجز:', error.message);
            throw error;
        }
    }

    // 🔄 الاستماع للتحديثات الفورية (Realtime)
    subscribeToBookings(callback) {
        try {
            const subscription = this.client
                .channel('bookings_channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookings'
                    },
                    (payload) => {
                        console.log('📡 تحديث فوري من Supabase:', payload);
                        callback(payload);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ تم الاشتراك في التحديثات الفورية');
                    }
                });

            return subscription;
        } catch (error) {
            console.error('❌ خطأ في الاشتراك للتحديثات:', error.message);
            return null;
        }
    }
}

// إنشاء instance من الخدمة
const supabaseService = new SupabaseService(supabaseClient);
