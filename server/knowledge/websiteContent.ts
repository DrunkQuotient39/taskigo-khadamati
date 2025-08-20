// Taskego (Khadamati) Website Knowledge Base
// Keep content concise and high-signal. The AI assistant will ONLY answer from this content.

export const WEBSITE_KNOWLEDGE_EN = `
About Taskego (Khadamati)
- A bilingual (English/Arabic) service marketplace connecting customers with local service providers.
- Core features: service browsing and filtering, provider applications, bookings, payments, notifications, and an admin panel.

Key Areas
- Services: Cleaning, Plumbing, Electrical, Delivery, Maintenance, Painting, Gardening, Tutoring, and more.
- Booking: Choose service, date/time, location, and extra details. Statuses include pending, accepted, in_progress, completed, cancelled.
- Payments: Card (Stripe) implemented; Apple Pay endpoints are development mocks unless merchant validation is configured. Platform fee may apply.
- Accounts & Roles: client, provider, admin. Providers can apply and require approval before creating services. Admins can manage users, services, and approvals.
- Language & RTL: Full English/Arabic support with RTL layout for Arabic.

Pages & Navigation
- Home: Overview, categories, CTA to Services.
- Services: Browse/filter by category, price, rating, location (basic string match), and sort.
- Service Detail: Descriptions, pricing, duration, reviews (sample), and provider info.
- Booking: Form to schedule a service with validation.
- Provider Dashboard: Stats, recent bookings, and service management (UI scaffolding).
- Admin Panel: Stats, pending approvals, user management (UI scaffolding; APIs available).
- Chat: AI assistant to guide users (website-related only).

Policies & Support
- Refunds: Supported via payment provider; refunds update booking/payment status accordingly.
- Security: Rate limiting, input validation, CORS, security headers, and logging are enabled on the API.
- Contact: Contact page with form and office info; support offered in English/Arabic.

Limitations & Notes
- Apple Pay is mocked by default; production requires merchant validation setup.
- Location search is basic (string-based, no geo-distance).
- Some front-end displays use sample data; APIs exist for real data once configured.
- AI suggestions rely on OpenAI if configured; otherwise fallbacks are used.
`;

export const WEBSITE_KNOWLEDGE_AR = `
حول تاسكيجو (خدماتي)
- منصة خدمات ثنائية اللغة (إنجليزي/عربي) تربط العملاء بمقدمي الخدمات المحليين.
- الميزات الأساسية: تصفح الخدمات وتصفية النتائج، طلبات الانضمام لمقدمي الخدمات، الحجز، الدفع، الإشعارات، ولوحة تحكم للمشرف.

الأقسام الرئيسية
- الخدمات: التنظيف، السباكة، الكهرباء، التوصيل، الصيانة، الدهان، البستنة، الدروس الخصوصية وغيرها.
- الحجز: اختيار الخدمة، التاريخ/الوقت، الموقع، والتفاصيل الإضافية. حالات الحجز: قيد الانتظار، مقبول، قيد التنفيذ، مكتمل، ملغي.
- الدفع: الدفع بالبطاقة (Stripe) مفعّل؛ Apple Pay في وضع التطوير ما لم يتم إعداد التحقق الخاص بالتاجر. قد تُطبق رسوم المنصة.
- الحسابات والأدوار: عميل، مقدم خدمة، مشرف. مقدمو الخدمات يحتاجون الموافقة قبل إنشاء الخدمات. يمكن للمشرف إدارة المستخدمين والخدمات والموافقات.
- اللغة والاتجاه: دعم كامل للإنجليزية/العربية مع اتجاه RTL للعربية.

الصفحات والتنقل
- الرئيسية: نظرة عامة وفئات وخيارات للانتقال إلى صفحة الخدمات.
- الخدمات: تصفح/تصفية حسب الفئة والسعر والتقييم والموقع (مطابقة نصية بسيطة) والترتيب.
- صفحة الخدمة: الوصف، التسعير، المدة، المراجعات (نموذجية)، ومعلومات مقدم الخدمة.
- الحجز: نموذج لحجز خدمة مع تحقق من صحة البيانات.
- لوحة مقدم الخدمة: إحصائيات، حجوزات حديثة، وإدارة الخدمات (واجهة جاهزة).
- لوحة المشرف: إحصائيات، موافقات معلّقة، وإدارة المستخدمين (واجهة جاهزة؛ واجهات برمجية متوفرة).
- الدردشة: مساعد ذكي لإرشاد المستخدمين (خاص بموقع تاسكيجو فقط).

السياسات والدعم
- الاسترجاع: مدعوم عبر مزود الدفع؛ يتم تحديث حالة الدفع/الحجز وفقاً لذلك.
- الأمان: تحديد المعدل، التحقق من المدخلات، CORS، رؤوس أمان، وتسجيل السجلات مفعّلة.
- التواصل: صفحة اتصل بنا ونموذج مراسلة ومعلومات مكاتب؛ دعم باللغتين.

ملاحظات وحدود
- Apple Pay افتراضيًا في وضع محاكاة؛ يتطلب إعداد تحقق تاجر للإنتاج.
- البحث بالموقع نصي بسيط (بدون حساب المسافة الجغرافية).
- بعض واجهات العرض الأمامية تستخدم بيانات نموذجية؛ الواجهات البرمجية متاحة للبيانات الحقيقية عند الإعداد.
- تعتمد اقتراحات الذكاء الاصطناعي على OpenAI عند التهيئة؛ وإلا يتم استخدام بدائل بسيطة.
`;

