# تطبيق إدارة تجارة الدواجن - React Native

تطبيق أندرويد لإدارة تجارة الدواجن مع قاعدة بيانات سحابية Back4App.

## الميزات

- ✅ إدارة العملاء (إضافة، تعديل، حذف)
- ✅ السجلات اليومية (إضافة، حذف)
- ✅ حساب تلقائي للوزن والإجمالي
- ✅ ملخص يومي
- ✅ حفظ البيانات في السحابة (Back4App)
- ✅ مزامنة البيانات بين الأجهزة

## إعداد Back4App

### 1. إنشاء حساب على Back4App
1. اذهب إلى [https://www.back4app.com/](https://www.back4app.com/)
2. أنشئ حساب جديد أو سجل دخولك
3. أنشئ App جديد (مثلاً: poultry-app)

### 2. الحصول على مفاتيح التطبيق
1. من لوحة تحكم المشروع: **App Settings → Security & Keys**
2. انسخ **Application ID** و **Client Key**

### 3. تحديث إعدادات التطبيق
1. افتح ملف `config/parse.ts`
2. استبدل القيم التالية:
   ```typescript
   const PARSE_APPLICATION_ID = 'YOUR_APPLICATION_ID'; // ضع Application ID هنا
   const PARSE_JAVASCRIPT_KEY = 'YOUR_JAVASCRIPT_KEY'; // ضع Client Key هنا
   ```

## تشغيل التطبيق

### تثبيت المكتبات
```bash
npm install
```

### تشغيل التطبيق
```bash
npm start
```

### على الهاتف
1. قم بتحميل تطبيق **Expo Go** من متجر Google Play
2. امسح رمز QR الذي يظهر في المتصفح
3. سيتم فتح التطبيق على هاتفك

## هيكل المشروع

```
poultry-mobile/
├── app/
│   └── (tabs)/
│       ├── index.tsx          # شاشة إدارة العملاء
│       └── two.tsx            # شاشة السجلات اليومية
├── config/
│   └── parse.ts               # إعدادات Back4App
├── services/
│   ├── customerService.ts     # خدمة العملاء
│   └── dailyRecordService.ts  # خدمة السجلات اليومية
└── README.md
```

## الملفات المهمة

### `config/parse.ts`
إعدادات ربط التطبيق بـ Back4App

### `services/customerService.ts`
خدمة للتعامل مع بيانات العملاء في Back4App

### `services/dailyRecordService.ts`
خدمة للتعامل مع السجلات اليومية في Back4App

## الميزات التقنية

- **React Native** مع Expo
- **TypeScript** للبرمجة الآمنة
- **Back4App** لقاعدة البيانات السحابية
- **Parse SDK** للتعامل مع البيانات
- **AsyncStorage** للتخزين المحلي المؤقت

## استكشاف الأخطاء

### مشكلة في الاتصال بـ Back4App
1. تأكد من صحة Application ID و Client Key
2. تأكد من وجود اتصال بالإنترنت
3. تحقق من لوحة تحكم Back4App

### مشكلة في تحميل البيانات
1. تأكد من إنشاء جداول (Classes) في Back4App
2. تحقق من صلاحيات الوصول
3. أعد تشغيل التطبيق

## بناء ملف APK

```bash
npx expo build:android
```

## الدعم

إذا واجهت أي مشاكل، يرجى:
1. التحقق من إعدادات Back4App
2. التأكد من صحة مفاتيح التطبيق
3. التحقق من اتصال الإنترنت # Mobile-application-for-management
