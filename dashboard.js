// ===============================================================
// 1. الصق هنا نفس مفاتيح الربط التي استخدمتها في صفحة التسجيل
// ===============================================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // الصق هنا Project URL
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // الصق هنا anon public key

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// استهداف العناصر في صفحة HTML
const visitorCountElement = document.getElementById('visitor-count');
const visitorListElement = document.getElementById('visitor-list');

// ===============================================================
// 2. دالة لجلب وعرض بيانات الزوار
// ===============================================================
async function fetchAndDisplayVisitors() {
    try {
        // اطلب كل البيانات (*) من جدول 'visitors' ورتبهم حسب تاريخ الإنشاء (الأحدث أولاً)
        const { data: visitors, error } = await supabase
            .from('visitors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // تحديث إجمالي عدد الزوار
        visitorCountElement.textContent = visitors.length;

        // مسح أي بيانات قديمة في الجدول
        visitorListElement.innerHTML = '';

        // المرور على كل زائر في البيانات وإضافته كصف جديد في الجدول
        visitors.forEach(visitor => {
            const row = document.createElement('tr');

            // تحويل صيغة التاريخ لوقت مقروء
            const formattedDate = new Date(visitor.created_at).toLocaleString('ar-SA');

            row.innerHTML = `
                <td>${visitor.name}</td>
                <td>${formattedDate}</td>
            `;

            visitorListElement.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching data:', error.message);
        visitorCountElement.textContent = 'خطأ في التحميل';
    }
}

// ===============================================================
// 3. تشغيل الدالة عند تحميل الصفحة
// ===============================================================
fetchAndDisplayVisitors();
