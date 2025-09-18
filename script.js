document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const visitorNameInput = document.getElementById('visitor-name');
    const registrationForm = document.getElementById('registration-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    // الصق رابط تطبيق الويب الخاص بك هنا
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwgnZHKIxLR5EEeMsry9c-D_nO5LIfTFbEo7enSGujWUWTqu5bWQcfX0qw5v91mE6g/exec'; 

    submitBtn.addEventListener('click', () => {
        const name = visitorNameInput.value.trim();
        if (name === '') {
            alert('الرجاء إدخال اسمك.');
            return;
        }

        // تعطيل الزر لمنع الإرسال المتكرر
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري التسجيل...';

        // إرسال البيانات إلى Google Sheet
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // ضروري لتجنب مشاكل CORS مع Apps Script
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        })
        .then(() => {
            // إخفاء نموذج التسجيل وإظهار رسالة الشكر
            registrationForm.classList.add('hidden');
            thankYouMessage.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('عفواً، حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
            // إعادة تفعيل الزر في حالة حدوث خطأ
            submitBtn.disabled = false;
            submitBtn.textContent = 'تسجيل الحضور';
        });
    });
});
