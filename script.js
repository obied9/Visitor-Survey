
    // ===============================================================
    // 1. الصق هنا مفاتيح الربط التي نسختها من Supabase
    // ===============================================================
    const SUPABASE_URL = 'https://vlbtzwebjfsbniqcsmpj.supabase.co'; // الصق هنا Project URL
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnR6d2ViamZzYm5pcWNzbXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzk1MDgsImV4cCI6MjA3Mzc1NTUwOH0.CsU1jqblx93GK8b-Rgla2s2K-4uxtaH7JyPMSjar73M'; // الصق هنا anon public key

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// استهداف العناصر في صفحة HTML
const registrationForm = document.getElementById('registration-form');
const cardDisplaySection = document.getElementById('card-display-section');
const visitorNameInput = document.getElementById('visitor-name');
const submitBtn = document.getElementById('submit-btn');

const visitorIdCard = document.getElementById('visitorIdCard');
const cardUniqueIdElement = document.getElementById('cardUniqueId');
const visitorNameDisplayElement = document.getElementById('visitorNameDisplay');
const qrCanvas = document.getElementById('cardQrCanvas');

const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const createNewCardBtn = document.getElementById('createNewCardBtn');
const currentYearElement = document.getElementById('currentYear');

// ===============================================================
// 2. الدالة الرئيسية لإضافة الزائر وإنشاء البطاقة
// ===============================================================
async function addVisitorAndCreateCard(name) {
    try {
        // --- تعديل مهم: نطلب من Supabase إعادة بيانات الصف الجديد بعد إضافته ---
        const { data, error } = await supabase
            .from('visitors')
            .insert([{ name: name }])
            .select() // هذا السطر يطلب إعادة البيانات

        if (error) throw error;
        
        // --- استخراج المعرف الفريد (UUID) من البيانات العائدة ---
        const newVisitor = data[0];
        const formattedId = "vs" + newVisitor.ticket_id;

        // --- عرض البيانات في البطاقة ---
        visitorNameDisplayElement.textContent = newVisitor.name;
        cardUniqueIdElement.textContent = formattedId;

        // --- إنشاء QR Code باستخدام المعرف الفريد ---
        await QRCode.toCanvas(qrCanvas, formattedId, { width: 180 });

        // --- إظهار البطاقة وإخفاء نموذج التسجيل ---
        registrationForm.classList.add('hidden');
        cardDisplaySection.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error.message);
        alert('عفواً، حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'إنشاء البطاقة';
    }
}

// ===============================================================
// 3. ربط الأحداث بالأزرار
// ===============================================================

// عند الضغط على زر التسجيل
submitBtn.addEventListener('click', () => {
    const name = visitorNameInput.value.trim();
    if (name === '') {
        alert('الرجاء إدخال اسمك.');
        return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإنشاء...';
    addVisitorAndCreateCard(name);
});

// عند الضغط على زر تحميل PNG
downloadPngBtn.addEventListener('click', () => {
    html2canvas(visitorIdCard).then(canvas => {
        const link = document.createElement('a');
        link.download = `visitor-card-${cardUniqueIdElement.textContent}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

// عند الضغط على زر تحميل PDF
downloadPdfBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    html2canvas(visitorIdCard, { scale: 2 }).then(canvas => { // زيادة الدقة للطباعة
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [visitorIdCard.offsetWidth, visitorIdCard.offsetHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, visitorIdCard.offsetWidth, visitorIdCard.offsetHeight);
        pdf.save(`visitor-card-${cardUniqueIdElement.textContent}.pdf`);
    });
});

// عند الضغط على زر "تسجيل زائر آخر"
createNewCardBtn.addEventListener('click', () => {
    cardDisplaySection.classList.add('hidden');
    registrationForm.classList.remove('hidden');
    visitorNameInput.value = ''; // مسح حقل الإدخال
    submitBtn.disabled = false;
    submitBtn.textContent = 'إنشاء البطاقة';
});

// تحديث سنة الحقوق
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}
