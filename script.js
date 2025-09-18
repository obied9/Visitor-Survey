document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const visitorNameInput = document.getElementById('visitor-name');
    const registrationForm = document.getElementById('registration-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // ===============================================================
    // 1. الصق هنا مفاتيح الربط التي نسختها من Supabase
    // ===============================================================
    const SUPABASE_URL = 'https://vlbtzwebjfsbniqcsmpj.supabase.co'; // الصق هنا Project URL
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnR6d2ViamZzYm5pcWNzbXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzk1MDgsImV4cCI6MjA3Mzc1NTUwOH0.CsU1jqblx93GK8b-Rgla2s2K-4uxtaH7JyPMSjar73M'; // الصق هنا anon public key

    // تهيئة Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ===============================================================
    // 2. هذه هي الدالة الجديدة التي ترسل البيانات إلى Supabase
    // ===============================================================
    async function addVisitor(name) {
        try {
            // استخدم دالة insert() من مكتبة Supabase لإضافة صف جديد
            const { data, error } = await supabase
                .from('visitors') // اسم الجدول الذي أنشأته
                .insert([
                    { name: name }, // البيانات التي تريد إضافتها
                ]);

            if (error) {
                // إذا حدث خطأ من Supabase، اعرضه في الـ console
                throw error;
            }

            // إذا نجحت العملية
            registrationForm.classList.add('hidden');
            thankYouMessage.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error.message);
            alert('عفواً، حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
            // إعادة تفعيل الزر في حالة حدوث خطأ
            submitBtn.disabled = false;
            submitBtn.textContent = 'تسجيل الحضور';
        }
    }


    submitBtn.addEventListener('click', () => {
        const name = visitorNameInput.value.trim();
        if (name === '') {
            alert('الرجاء إدخال اسمك.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري التسجيل...';

        // استدعاء الدالة الجديدة
        addVisitor(name);
    });
});
