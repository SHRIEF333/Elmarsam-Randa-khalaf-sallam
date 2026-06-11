// Firebase Service - خدمة التعامل مع Firebase
class FirebaseService {
    constructor() {
        this.db = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        try {
            // التحقق من وجود Firebase و firebaseConfig
            if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
                console.warn('⚠️ Firebase غير مهيأ. تحقق من firebase-config.js');
                return;
            }

            // التحقق من أن البيانات صحيحة
            if (firebaseConfig.apiKey.includes('YOUR_')) {
                console.warn('⚠️ يرجى تعديل firebase-config.js بالبيانات الصحيحة');
                return;
            }

            this.db = firebase.database();
            this.checkConnection();
            console.log('✅ Firebase Service مهيأ بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة Firebase:', error);
        }
    }

    checkConnection() {
        if (!this.db) return;

        // التحقق من الاتصال
        const connectedRef = this.db.ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                this.isConnected = true;
                console.log('🟢 متصل بـ Firebase');
            } else {
                this.isConnected = false;
                console.log('🔴 غير متصل بـ Firebase - الوضع المحلي');
            }
        });
    }

    // إضافة حجز جديد
    async addBooking(booking) {
        if (!this.db || !this.isConnected) {
            console.warn('⚠️ Firebase غير متصل، الحفظ محلي فقط');
            return null;
        }

        try {
            const bookingRef = this.db.ref('bookings').push();
            await bookingRef.set({
                ...booking,
                id: bookingRef.key,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                createdAt: new Date().toLocaleString('ar-EG')
            });

            console.log('✅ تم إضافة الحجز في Firebase:', bookingRef.key);
            return bookingRef.key;
        } catch (error) {
            console.error('❌ خطأ في إضافة الحجز:', error);
            return null;
        }
    }

    // الاستماع للحجوزات الجديدة
    onNewBooking(callback) {
        if (!this.db) return;

        const bookingsRef = this.db.ref('bookings');
        
        // الحصول على جميع الحجوزات القديمة أولاً
        bookingsRef.orderByChild('timestamp').limitToLast(100).on('child_added', (snapshot) => {
            const booking = snapshot.val();
            if (booking) {
                callback(booking);
            }
        });
    }

    // الحصول على جميع الحجوزات
    async getAllBookings() {
        if (!this.db || !this.isConnected) {
            console.warn('⚠️ Firebase غير متصل');
            return [];
        }

        try {
            const snapshot = await this.db.ref('bookings').get();
            if (snapshot.exists()) {
                return Object.values(snapshot.val());
            }
            return [];
        } catch (error) {
            console.error('❌ خطأ في جلب الحجوزات:', error);
            return [];
        }
    }

    // حذف حجز
    async deleteBooking(bookingId) {
        if (!this.db || !this.isConnected) return false;

        try {
            await this.db.ref('bookings/' + bookingId).remove();
            console.log('✅ تم حذف الحجز من Firebase');
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف الحجز:', error);
            return false;
        }
    }

    // تحديث حجز
    async updateBooking(bookingId, updates) {
        if (!this.db || !this.isConnected) return false;

        try {
            await this.db.ref('bookings/' + bookingId).update(updates);
            console.log('✅ تم تحديث الحجز في Firebase');
            return true;
        } catch (error) {
            console.error('❌ خطأ في تحديث الحجز:', error);
            return false;
        }
    }

    // إضافة إشعار
    async addNotification(notification) {
        if (!this.db || !this.isConnected) return null;

        try {
            const notifRef = this.db.ref('notifications').push();
            await notifRef.set({
                ...notification,
                id: notifRef.key,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            console.log('✅ تم إضافة الإشعار في Firebase');
            return notifRef.key;
        } catch (error) {
            console.error('❌ خطأ في إضافة الإشعار:', error);
            return null;
        }
    }

    // الاستماع للإشعارات
    onNewNotification(callback) {
        if (!this.db) return;

        const notifRef = this.db.ref('notifications');
        notifRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
            const notification = snapshot.val();
            if (notification) {
                callback(notification);
            }
        });
    }

    // مراقبة تغييرات في الحجوزات
    onBookingChanged(callback) {
        if (!this.db) return;

        const bookingsRef = this.db.ref('bookings');
        
        bookingsRef.on('child_changed', (snapshot) => {
            const booking = snapshot.val();
            if (booking) {
                console.log('🔄 حجز تم تعديله:', booking);
                callback({ type: 'updated', booking });
            }
        });

        bookingsRef.on('child_removed', (snapshot) => {
            console.log('🗑️ حجز تم حذفه:', snapshot.key);
            callback({ type: 'deleted', bookingId: snapshot.key });
        });
    }

    // إرسال البيانات عبر localStorage أيضاً (للنسخ المحلية)
    syncToLocalStorage(bookings) {
        try {
            localStorage.setItem('elmarsam_bookings_firebase', JSON.stringify(bookings));
        } catch (error) {
            console.error('❌ خطأ في حفظ localStorage:', error);
        }
    }

    // التحقق من الاتصال
    getConnectionStatus() {
        return this.isConnected;
    }
}

// إنشاء instance واحد
const firebaseService = typeof FirebaseService !== 'undefined' ? new FirebaseService() : null;

console.log('✅ Firebase Service script محمّل');
