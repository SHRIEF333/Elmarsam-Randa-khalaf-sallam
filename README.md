# 📚 نظام إدارة الحجوزات - المرسم

نظام احترافي وأونلاين لإدارة حجوزات الكورسات مع مزامنة فورية بين الأجهزة.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ المميزات

### 🎯 الإدارة الأساسية
- ✅ إضافة، تعديل، وحذف الحجوزات
- ✅ البحث والفلترة المتقدمة
- ✅ تقارير وإحصائيات مفصلة
- ✅ تصدير البيانات إلى PDF

### 🌐 الأونلاين والمزامنة
- ✅ مزامنة فورية بين الأجهزة
- ✅ Firebase Realtime Database
- ✅ إشعارات فورية للحجوزات الجديدة
- ✅ يعمل بدون إنترنت (الوضع المحلي)

### 💳 نظام الدفع
- ✅ عدة طرق دفع (فودافون، إنستاباي، فوري، بطاقات)
- ✅ صفحة دفع احترافية
- ✅ حسابات فورية للمبالغ

### 🎨 التصميم
- ✅ واجهة عربية RTL جميلة
- ✅ responsive design (هاتف + تابلت + ويب)
- ✅ dark mode جاهز
- ✅ animations سلسة

---

## 🚀 البدء السريع

### المتطلبات
- متصفح حديث (Chrome, Firefox, Safari)
- اتصال إنترنت (للمزامنة)
- حساب Firebase (مجاني)

### التثبيت

1. **استنساخ المشروع:**
```bash
git clone https://github.com/your-username/elmarsam-main.git
cd elmarsam-main/elmarsam-main
```

2. **إعداد Firebase:**
   - اتبع تعليمات [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
   - انسخ بيانات Firebase إلى `firebase-config.js`

3. **التشغيل المحلي:**
```bash
# باستخدام Python
python -m http.server 8000

# أو باستخدام Node.js
npx http-server
```

4. **فتح في المتصفح:**
- الصفحة الرئيسية: `http://localhost:8000/index.html`
- صفحة الدفع: `http://localhost:8000/payment.html`

---

## 📱 الاستخدام

### للعملاء (صفحة الدفع):
```
1. ادخل بيانات الدفع
2. اختر طريقة الدفع
3. اضغط "الخطوة التالية"
→ البيانات تظهر فوراً على الجهاز الآخر!
```

### للمسؤول (الصفحة الرئيسية):
```
1. شاهد قائمة الحجوزات المحدثة تلقائياً
2. ادير الحجوزات (إضافة، تعديل، حذف)
3. شاهد التقارير والإحصائيات
4. صدّر البيانات إلى PDF للطباعة
```

---

## 🏗️ هيكل المشروع

```
elmarsam-main/
├── index.html              # الصفحة الرئيسية
├── payment.html            # صفحة الدفع
├── style.css               # الأنماط المشتركة
├── script.js               # كود الإدارة الرئيسي
├── payment.js              # كود نظام الدفع
├── firebase-config.example.js  # مثال الإعدادات
├── firebase-service.js     # خدمة Firebase
├── FIREBASE_SETUP.md       # تعليمات Firebase
├── README.md               # هذا الملف
└── elmarsam_logo.png       # شعار المشروع
```

---

## 🔧 التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| HTML5 | البنية الأساسية |
| CSS3 | التصميم والـ Animations |
| JavaScript (Vanilla) | البرمجة والتفاعل |
| Firebase Realtime DB | قاعدة البيانات السحابية |
| HTML2PDF | تصدير PDF |
| LocalStorage | الحفظ المحلي |

---

## 📊 قاعدة البيانات

### هيكل البيانات في Firebase:

```json
{
  "bookings": {
    "booking_1": {
      "personName": "أحمد محمد",
      "courseName": "🎨 مستوى أول (4 حصص) - 100 ج",
      "amount": 100,
      "phone": "01012345678",
      "bookingDate": "2026-06-11",
      "notes": "الهاتف: 01012345678",
      "paymentStatus": "completed",
      "timestamp": 1686470400000
    }
  },
  "notifications": {
    "notif_1": {
      "personName": "أحمد محمد",
      "message": "أحمد محمد دفع 100 جنيه",
      "timestamp": 1686470400000
    }
  }
}
```

---

## 🌍 النشر على GitHub Pages

### 1. رفع على GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. تفعيل GitHub Pages:
1. اذهب إلى Settings → Pages
2. اختر `main` branch
3. اختر `/root` folder
4. اضغط Save

### 3. الرابط النهائي:
```
https://your-username.github.io/elmarsam-main/
```

---

## 🔐 الأمان

⚠️ **تحذير:** 
- لا تُرفع `firebase-config.js` مع بيانات حقيقية على GitHub
- استخدم `.gitignore` لتجاهلها
- في الإنتاج، استخدم Firebase Security Rules

---

## 📝 المتطلبات المستقبلية

- [ ] Dark Mode كامل
- [ ] إحصائيات رسومية متقدمة
- [ ] تصدير إلى Excel
- [ ] نظام المستخدمين والصلاحيات
- [ ] الدفع الفعلي (Stripe, PayPal)
- [ ] تطبيق موبايل (React Native)

---

## 🤝 المساهمة

نرحب بالمساهمات!

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push إلى الـ branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 💬 الدعم

للمساعدة والأسئلة:
- 📧 البريد الإلكتروني: support@almursam.com
- 💬 مجموعة WhatsApp: [الرابط]
- 🐛 الإبلاغ عن الأخطاء: [GitHub Issues]

---

## 🙏 شكر خاص

- Firebase لـ Database الممتاز
- GitHub Pages للـ Hosting المجاني
- المجتمع المصري للبرمجة

---

## 📞 التواصل

**تطور بواسطة:** المرسم لتعليم الفنون
**الموقع:** https://elmarsam.com
**البريد:** info@elmarsam.com

---

**شكراً لاستخدامك نظام إدارة الحجوزات - المرسم! 🎨**

> Made with ❤️ in Egypt
