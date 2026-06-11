// Booking Management System - نسخة أونلاين مع Supabase Realtime
class BookingManager {
    constructor() {
        this.bookings = this.loadBookings();
        this.notifications = this.loadNotifications();
        this.currentEditingId = null;
        this.supabaseSubscription = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.renderBookings();
        this.updateReports();
        this.updateNotificationsBadge();
        this.setupMessageListener();
        this.initializeSupabase();
        this.setupConnectionMonitor();
    }

    setupConnectionMonitor() {
        window.addEventListener('online', () => {
            console.log('✅ متصل بالإنترنت');
            this.isOnline = true;
            this.updateConnectionStatus(true);
            this.loadBookingsFromSupabase();
        });

        window.addEventListener('offline', () => {
            console.log('⚠️ قطع الاتصال بالإنترنت');
            this.isOnline = false;
            this.updateConnectionStatus(false);
        });

        this.updateConnectionStatus(this.isOnline);
    }

    initializeSupabase() {
        setTimeout(() => {
            try {
                if (typeof supabaseService !== 'undefined' && navigator.onLine) {
                    console.log('🚀 بدء الاستماع لتحديثات Supabase...');
                    this.loadBookingsFromSupabase();
                    this.subscribeToRealtimeUpdates();
                    this.updateConnectionStatus(true);
                } else {
                    console.log('⚠️ Supabase غير متاح - الوضع المحلي');
                    this.updateConnectionStatus(false);
                }
            } catch (error) {
                console.warn('⚠️ خطأ في تهيئة Supabase:', error);
                this.updateConnectionStatus(false);
            }
        }, 500);
    }

    async loadBookingsFromSupabase() {
        try {
            if (!navigator.onLine) {
                console.log('⚠️ بلا إنترنت - استخدام البيانات المحفوظة محلياً');
                return;
            }

            const bookings = await supabaseService.getBookings();
            if (bookings && bookings.length > 0) {
                this.bookings = bookings.map(b => ({
                    id: b.id,
                    personName: b.person_name,
                    courseName: b.course_name,
                    amount: b.amount,
                    bookingDate: b.booking_date,
                    notes: b.notes,
                    paymentStatus: b.payment_status,
                    createdAt: b.created_at
                }));

                this.saveBookings();
                this.renderBookings();
                this.updateReports();
                console.log('✅ تم تحميل البيانات من Supabase');
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error);
        }
    }

    // 🔄 الاستماع للتحديثات الفورية
    subscribeToRealtimeUpdates() {
        if (this.supabaseSubscription) {
            this.supabaseSubscription.unsubscribe();
        }

        try {
            this.supabaseSubscription = supabaseService.subscribeToBookings((payload) => {
                console.log('📡 تحديث فوري من Supabase:', payload.eventType);

                if (payload.eventType === 'INSERT') {
                    const newBooking = {
                        id: payload.new.id,
                        personName: payload.new.person_name,
                        courseName: payload.new.course_name,
                        amount: payload.new.amount,
                        bookingDate: payload.new.booking_date,
                        notes: payload.new.notes,
                        paymentStatus: payload.new.payment_status,
                        createdAt: payload.new.created_at
                    };

                    if (!this.bookings.find(b => b.id === newBooking.id)) {
                        this.bookings.unshift(newBooking);
                        this.saveBookings();
                        this.renderBookings();
                        this.updateReports();
                        this.playNotificationSound();
                        this.showNotificationAlert(newBooking);
                        this.addNotificationForBooking(newBooking);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    const index = this.bookings.findIndex(b => b.id === payload.new.id);
                    if (index !== -1) {
                        this.bookings[index] = {
                            id: payload.new.id,
                            personName: payload.new.person_name,
                            courseName: payload.new.course_name,
                            amount: payload.new.amount,
                            bookingDate: payload.new.booking_date,
                            notes: payload.new.notes,
                            paymentStatus: payload.new.payment_status,
                            createdAt: payload.new.created_at
                        };
                        this.saveBookings();
                        this.renderBookings();
                        this.updateReports();
                    }
                } else if (payload.eventType === 'DELETE') {
                    this.bookings = this.bookings.filter(b => b.id !== payload.old.id);
                    this.saveBookings();
                    this.renderBookings();
                    this.updateReports();
                }
            });
        } catch (error) {
            console.error('❌ خطأ في الاشتراك للتحديثات:', error);
        }
    }

    setupEventListeners() {
        // Notifications Button
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsPanel = document.getElementById('notificationsPanel');
        
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                if (notificationsPanel.classList.contains('show')) {
                    notificationsPanel.style.maxHeight = null;
                    notificationsPanel.classList.remove('show');
                } else {
                    notificationsPanel.classList.add('show');
                    notificationsPanel.style.maxHeight = notificationsPanel.scrollHeight + 'px';
                    this.renderNotifications();
                }
            });
        }
        
        if (notificationsPanel) {
            notificationsPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            const clearBtn = document.getElementById('clearNotifications');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearNotifications());
            }
        }

        document.addEventListener('click', (e) => {
            if (notificationsBtn && notificationsPanel && 
                !notificationsBtn.contains(e.target) && !notificationsPanel.contains(e.target)) {
                if (notificationsPanel.classList.contains('show')) {
                    notificationsPanel.style.maxHeight = null;
                    notificationsPanel.classList.remove('show');
                }
            }
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Course price mapping
        this.coursePrice = {
            '🎨 مستوى اول (4 حصص) - 100 ج': '100',
            '🎨 مستوى ثاني (4 حصص) - 120 ج': '120',
            '🎨 مستوى ثالث (4 حصص) - 120 ج': '120',
            '🎨 مستوى متقدم واساسيات بورتريه (4 حصص) - 150 ج': '150'
        };

        // Auto-fill price for Add form
        const courseSelect = document.getElementById('courseName');
        const amountSelect = document.getElementById('amount');
        
        if (courseSelect && amountSelect) {
            courseSelect.addEventListener('change', () => {
                const selectedCourse = courseSelect.value;
                if (this.coursePrice[selectedCourse]) {
                    amountSelect.value = this.coursePrice[selectedCourse];
                }
            });
        }

        // Auto-fill price for Edit form
        const editCourseSelect = document.getElementById('editCourseName');
        const editAmountSelect = document.getElementById('editAmount');
        
        if (editCourseSelect && editAmountSelect) {
            editCourseSelect.addEventListener('change', () => {
                const selectedCourse = editCourseSelect.value;
                if (this.coursePrice[selectedCourse]) {
                    editAmountSelect.value = this.coursePrice[selectedCourse];
                }
            });
        }

        // Add booking form
        const addForm = document.getElementById('addBookingForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBooking();
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterBookings(e.target.value);
            });
        }

        // Edit modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEditModal());
        }

        const cancelEditBtn = document.getElementById('cancelEdit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        }

        const editForm = document.getElementById('editBookingForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateBooking();
            });
        }

        // Delete modal
        const cancelDeleteBtn = document.getElementById('cancelDelete');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        }

        const confirmDeleteBtn = document.getElementById('confirmDelete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.deleteBooking());
        }

        // Modal background clicks
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target.id === 'editModal') this.closeEditModal();
            });
        }

        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target.id === 'deleteModal') this.closeDeleteModal();
            });
        }

        // Export to PDF button
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const bookingDate = document.getElementById('bookingDate');
        if (bookingDate) bookingDate.value = today;
        
        const editBookingDate = document.getElementById('editBookingDate');
        if (editBookingDate) editBookingDate.value = today;
    }

    // Local Storage Management
    loadBookings() {
        const stored = localStorage.getItem('elmarsam_bookings');
        return stored ? JSON.parse(stored) : [];
    }

    saveBookings() {
        localStorage.setItem('elmarsam_bookings', JSON.stringify(this.bookings));
    }

    // Booking CRUD Operations
    async addBooking() {
        const personName = document.getElementById('personName')?.value.trim();
        const courseName = document.getElementById('courseName')?.value.trim();
        const amount = parseFloat(document.getElementById('amount')?.value);
        const bookingDate = document.getElementById('bookingDate')?.value;
        const notes = document.getElementById('notes')?.value.trim();

        if (!personName || !courseName || !amount) {
            this.showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const booking = {
            id: Date.now(),
            personName,
            courseName,
            amount,
            bookingDate,
            notes,
            paymentStatus: 'completed',
            createdAt: new Date().toLocaleString('ar-EG')
        };

        try {
            // محاولة الحفظ في Supabase
            if (navigator.onLine && typeof supabaseService !== 'undefined') {
                await supabaseService.addBooking(booking);
            }
        } catch (error) {
            console.warn('⚠️ لم يتمكن من الحفظ في Supabase، جاري الحفظ محلياً:', error);
        }

        this.bookings.push(booking);
        this.saveBookings();

        document.getElementById('addBookingForm')?.reset();
        this.setDefaultDate();

        this.showNotification('✅ تم إضافة الحجز بنجاح', 'success');
        this.renderBookings();
        this.updateReports();
    }

    editBooking(id) {
        const booking = this.bookings.find(b => b.id === id);
        if (!booking) return;

        this.currentEditingId = id;
        const form = {
            editPersonName: document.getElementById('editPersonName'),
            editCourseName: document.getElementById('editCourseName'),
            editAmount: document.getElementById('editAmount'),
            editBookingDate: document.getElementById('editBookingDate'),
            editNotes: document.getElementById('editNotes')
        };

        if (form.editPersonName) form.editPersonName.value = booking.personName;
        if (form.editCourseName) form.editCourseName.value = booking.courseName;
        if (form.editAmount) form.editAmount.value = booking.amount;
        if (form.editBookingDate) form.editBookingDate.value = booking.bookingDate;
        if (form.editNotes) form.editNotes.value = booking.notes;

        const editModal = document.getElementById('editModal');
        if (editModal) editModal.classList.add('show');
    }

    async updateBooking() {
        const booking = this.bookings.find(b => b.id === this.currentEditingId);
        if (!booking) return;

        const form = {
            editPersonName: document.getElementById('editPersonName'),
            editCourseName: document.getElementById('editCourseName'),
            editAmount: document.getElementById('editAmount'),
            editBookingDate: document.getElementById('editBookingDate'),
            editNotes: document.getElementById('editNotes')
        };

        booking.personName = form.editPersonName?.value.trim() || booking.personName;
        booking.courseName = form.editCourseName?.value.trim() || booking.courseName;
        booking.amount = parseFloat(form.editAmount?.value) || booking.amount;
        booking.bookingDate = form.editBookingDate?.value || booking.bookingDate;
        booking.notes = form.editNotes?.value.trim() || booking.notes;

        try {
            // محاولة التحديث في Supabase
            if (navigator.onLine && typeof supabaseService !== 'undefined') {
                await supabaseService.updateBooking(booking.id, booking);
            }
        } catch (error) {
            console.warn('⚠️ لم يتمكن من التحديث في Supabase:', error);
        }

        this.saveBookings();
        this.showNotification('✅ تم تحديث الحجز بنجاح', 'success');
        this.closeEditModal();
        this.renderBookings();
        this.updateReports();
    }

    async deleteBooking(id = null) {
        const bookingId = id || this.currentEditingId;
        
        try {
            // محاولة الحذف من Supabase
            if (navigator.onLine && typeof supabaseService !== 'undefined') {
                await supabaseService.deleteBooking(bookingId);
            }
        } catch (error) {
            console.warn('⚠️ لم يتمكن من الحذف من Supabase:', error);
        }

        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.saveBookings();

        this.showNotification('✅ تم حذف الحجز بنجاح', 'success');
        this.closeDeleteModal();
        this.renderBookings();
        this.updateReports();
    }

    renderBookings(bookingsToRender = this.bookings) {
        const tbody = document.getElementById('bookingsTable');
        const noData = document.getElementById('noData');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (bookingsToRender.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        bookingsToRender.forEach((booking, index) => {
            const row = document.createElement('tr');
            
            if (index === 0 && booking.paymentStatus === 'completed') {
                row.classList.add('new-booking');
            }
            
            const status = booking.paymentStatus === 'completed' ? '✅ مدفوع' : '⏳ في الانتظار';
            const statusColor = booking.paymentStatus === 'completed' ? 'color: #28a745;' : 'color: #ffc107;';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${booking.personName}</strong></td>
                <td>${booking.courseName}</td>
                <td>${booking.amount.toFixed(2)} ج.م</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString('ar-EG')}</td>
                <td style="${statusColor}"><strong>${status}</strong></td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="manager.editBooking(${booking.id})" title="تعديل">✏️</button>
                    <button class="btn btn-sm btn-delete" onclick="manager.showDeleteConfirm(${booking.id})" title="حذف">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterBookings(searchTerm) {
        if (!searchTerm) {
            this.renderBookings();
            return;
        }

        const filtered = this.bookings.filter(booking =>
            booking.personName.includes(searchTerm) ||
            booking.courseName.includes(searchTerm)
        );

        this.renderBookings(filtered);
    }

    showDeleteConfirm(id) {
        this.currentEditingId = id;
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) deleteModal.classList.add('show');
    }

    closeEditModal() {
        const editModal = document.getElementById('editModal');
        if (editModal) editModal.classList.remove('show');
        this.currentEditingId = null;
    }

    closeDeleteModal() {
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) deleteModal.classList.remove('show');
        this.currentEditingId = null;
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeTab = document.getElementById(tabName);
        if (activeTab) activeTab.classList.add('active');
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Reports and Statistics
    updateReports() {
        this.updateMainStats();
        this.updateCourseStats();
        this.updateTopPayments();
    }

    updateMainStats() {
        const totalBookings = document.getElementById('totalBookings');
        if (totalBookings) totalBookings.textContent = this.bookings.length;

        const totalAmount = this.bookings.reduce((sum, b) => sum + b.amount, 0);
        const totalAmountEl = document.getElementById('totalAmount');
        if (totalAmountEl) totalAmountEl.textContent = totalAmount.toFixed(2) + 'ج.م';

        const uniqueCourses = new Set(this.bookings.map(b => b.courseName)).size;
        const uniqueCoursesEl = document.getElementById('uniqueCourses');
        if (uniqueCoursesEl) uniqueCoursesEl.textContent = uniqueCourses;

        const maxBooking = this.bookings.length > 0 ? Math.max(...this.bookings.map(b => b.amount)) : 0;
        const maxBookingEl = document.getElementById('maxBooking');
        if (maxBookingEl) maxBookingEl.textContent = maxBooking.toFixed(2) + 'ج.م';
    }

    updateCourseStats() {
        const courseStats = {};

        this.bookings.forEach(booking => {
            if (!courseStats[booking.courseName]) {
                courseStats[booking.courseName] = { count: 0, total: 0 };
            }
            courseStats[booking.courseName].count++;
            courseStats[booking.courseName].total += booking.amount;
        });

        const sorted = Object.entries(courseStats)
            .sort((a, b) => b[1].count - a[1].count);

        const tbody = document.getElementById('coursesStats');
        if (!tbody) return;

        tbody.innerHTML = '';
        sorted.forEach(([course, stats]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${course}</strong></td>
                <td>${stats.count}</td>
                <td>${stats.total.toFixed(2)} ج.م</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTopPayments() {
        const sorted = [...this.bookings]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const tbody = document.getElementById('topPayments');
        if (!tbody) return;

        tbody.innerHTML = '';
        sorted.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${booking.personName}</strong></td>
                <td>${booking.courseName}</td>
                <td>${booking.amount.toFixed(2)} ج.م</td>
            `;
            tbody.appendChild(row);
        });
    }

    exportToPDF() {
        if (this.bookings.length === 0) {
            this.showNotification('❌ لا توجد بيانات للتصدير', 'error');
            return;
        }

        const element = document.createElement('div');
        element.style.cssText = 'padding: 20px; background: white; direction: rtl;';
        
        const title = document.createElement('h1');
        title.textContent = '📋 قائمة الحجوزات - المرسم';
        title.style.cssText = 'text-align: center; color: #2c3e50; margin-bottom: 20px; font-size: 24px;';
        element.appendChild(title);

        const date = document.createElement('p');
        date.textContent = `تاريخ التقرير: ${new Date().toLocaleString('ar-EG')}`;
        date.style.cssText = 'text-align: center; color: #6c757d; margin-bottom: 20px; font-size: 14px;';
        element.appendChild(date);

        const table = document.createElement('table');
        table.style.cssText = 'width: 100%; border-collapse: collapse; margin-top: 20px;';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.cssText = 'background-color: #667eea; color: white;';
        
        const headers = ['#', 'اسم الشخص', 'اسم الكورس', 'المبلغ المدفوع', 'تاريخ الحجز', 'حالة الدفع'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cssText = 'border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        this.bookings.forEach((booking, index) => {
            const row = document.createElement('tr');
            row.style.cssText = 'border: 1px solid #ddd;';
            if (index % 2 === 0) {
                row.style.backgroundColor = '#f9f9f9';
            }

            const cells = [
                index + 1,
                booking.personName,
                booking.courseName,
                booking.amount.toFixed(2) + ' ج.م',
                new Date(booking.bookingDate).toLocaleDateString('ar-EG'),
                booking.paymentStatus === 'completed' ? '✅ مدفوع' : '⏳ في الانتظار'
            ];

            cells.forEach(cellContent => {
                const td = document.createElement('td');
                td.textContent = cellContent;
                td.style.cssText = 'border: 1px solid #ddd; padding: 12px; text-align: right;';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        element.appendChild(table);

        const summary = document.createElement('div');
        summary.style.cssText = 'margin-top: 30px; padding: 20px; background-color: #f0f4ff; border-radius: 8px;';
        
        const totalBookings = this.bookings.length;
        const totalAmount = this.bookings.reduce((sum, b) => sum + b.amount, 0);
        const uniqueCourses = new Set(this.bookings.map(b => b.courseName)).size;
        const completedPayments = this.bookings.filter(b => b.paymentStatus === 'completed').length;

        summary.innerHTML = `
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px;">📊 ملخص الإحصائيات</h3>
            <p style="margin: 10px 0; color: #495057; font-size: 14px;"><strong>📌 عدد الحجوزات:</strong> ${totalBookings}</p>
            <p style="margin: 10px 0; color: #495057; font-size: 14px;"><strong>💰 إجمالي المبالغ المدفوعة:</strong> ${totalAmount.toFixed(2)} جنيه</p>
            <p style="margin: 10px 0; color: #495057; font-size: 14px;"><strong>📚 عدد الكورسات المختلفة:</strong> ${uniqueCourses}</p>
            <p style="margin: 10px 0; color: #495057; font-size: 14px;"><strong>✅ الدفعات المكتملة:</strong> ${completedPayments}</p>
        `;
        element.appendChild(summary);

        const opt = {
            margin: 10,
            filename: `الحجوزات_${new Date().toLocaleDateString('ar-EG')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
        this.showNotification('✅ تم تحويل البيانات إلى PDF بنجاح', 'success');
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            font-weight: 600;
            animation: slideIn 0.3s;
            max-width: 400px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Notifications Management
    loadNotifications() {
        const stored = localStorage.getItem('elmarsam_notifications');
        return stored ? JSON.parse(stored) : [];
    }

    saveNotifications() {
        localStorage.setItem('elmarsam_notifications', JSON.stringify(this.notifications));
    }

    renderNotifications() {
        const list = document.getElementById('notificationsList');
        if (!list) return;
        
        if (this.notifications.length === 0) {
            list.innerHTML = '<p class="no-notifications">لا توجد إشعارات حالياً</p>';
            return;
        }

        list.innerHTML = '';
        this.notifications.forEach(notif => {
            const item = document.createElement('div');
            item.className = 'notification-item success';
            item.innerHTML = `
                <div class="notification-item-text">
                    ✅ ${notif.message}
                </div>
                <div class="notification-item-meta">
                    ${notif.timestamp}
                </div>
            `;
            list.appendChild(item);
        });
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        if (this.notifications.length > 50) {
            this.notifications.pop();
        }
        this.saveNotifications();
        this.updateNotificationsBadge();
        this.renderNotifications();
    }

    addNotificationForBooking(booking) {
        const notification = {
            id: booking.id || Date.now(),
            message: `${booking.personName} دفع ${booking.amount} جنيه`,
            timestamp: new Date().toLocaleString('ar-EG')
        };
        this.addNotification(notification);
    }

    clearNotifications() {
        if (confirm('هل تريد حذف جميع الإشعارات؟')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateNotificationsBadge();
            this.renderNotifications();
        }
    }

    updateNotificationsBadge() {
        const badge = document.getElementById('notificationsBadge');
        if (badge) {
            badge.textContent = this.notifications.length > 0 ? this.notifications.length : '0';
        }
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'NEW_PAYMENT') {
                const payment = event.data.data;
                
                console.log('📨 رسالة جديدة من صفحة الدفع:', payment);
                
                const booking = {
                    id: payment.id || Date.now(),
                    personName: payment.personName,
                    courseName: payment.courseName,
                    amount: payment.amount,
                    phone: payment.phone || '',
                    bookingDate: new Date().toISOString().split('T')[0],
                    notes: `الهاتف: ${payment.phone}\nطريقة الدفع: ${payment.method}`,
                    createdAt: payment.timestamp,
                    paymentStatus: 'completed'
                };
                
                if (!this.bookings.find(b => b.id === booking.id)) {
                    this.bookings.unshift(booking);
                    this.saveBookings();
                    this.renderBookings();
                    this.updateReports();
                    this.playNotificationSound();
                    this.showNotificationAlert(booking);
                    this.addNotificationForBooking(booking);

                    // محاولة الحفظ في Supabase
                    if (navigator.onLine && typeof supabaseService !== 'undefined') {
                        supabaseService.addBooking(booking).catch(err => 
                            console.warn('⚠️ لم يتمكن من الحفظ في Supabase:', err)
                        );
                    }
                }
            }
        });

        window.addEventListener('storage', (event) => {
            if (event.key === 'elmarsam_notifications' || event.key === 'elmarsam_bookings') {
                console.log('💾 تم كشف تحديث في localStorage');
                
                this.notifications = this.loadNotifications();
                this.bookings = this.loadBookings();
                
                this.updateNotificationsBadge();
                this.renderBookings();
                this.updateReports();
            }
        });
    }

    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('⚠️ لم يتمكن من تشغيل الصوت');
        }
    }

    showNotificationAlert(booking) {
        const alertBox = document.createElement('div');
        alertBox.className = 'booking-alert';
        alertBox.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">✅</div>
                <div class="alert-text">
                    <h4>حجز جديد! 🎉</h4>
                    <p><strong>${booking.personName}</strong> دفع ${booking.amount} جنيه</p>
                    <p class="alert-course">${booking.courseName}</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(alertBox);
        
        setTimeout(() => {
            if (alertBox.parentElement) {
                alertBox.remove();
            }
        }, 5000);
    }

    updateConnectionStatus(connected) {
        let statusDiv = document.getElementById('connectionStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'connectionStatus';
            statusDiv.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                font-weight: 600;
                z-index: 1000;
                font-size: 0.9em;
            `;
            document.body.appendChild(statusDiv);
        }

        if (connected) {
            statusDiv.textContent = '🟢 Online';
            statusDiv.style.background = '#28a745';
            statusDiv.style.color = 'white';
        } else {
            statusDiv.textContent = '🔴 Offline - Please connect your device to the internet or hotspot';
            statusDiv.style.background = '#bd1818';
            statusDiv.style.color = '#ffffff';
        }
    }
}

// Initialize the application
let manager;
document.addEventListener('DOMContentLoaded', () => {
    manager = new BookingManager();
    console.log('✅ نظام إدارة الحجوزات جاهز');
});
