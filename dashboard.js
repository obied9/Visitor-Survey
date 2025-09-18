// ===============================================================
// 1. الإعدادات الأساسية ومفاتيح الربط
// ===============================================================
const SUPABASE_URL = 'https://vlbtzwebjfsbniqcsmpj.supabase.co'; // الصق هنا Project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnR6d2ViamZzYm5pcWNzbXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzk1MDgsImV4cCI6MjA3Mzc1NTUwOH0.CsU1jqblx93GK8b-Rgla2s2K-4uxtaH7JyPMSjar73M'; // الصق هنا anon public key

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// استهداف العناصر في صفحة HTML
const totalVisitorsElement = document.getElementById('total-visitors');
const visitorsTableBody = document.getElementById('visitors-table-body');
const lastUpdateTimeElement = document.getElementById('lastUpdateTime');
const currentYearElement = document.getElementById('currentYear');
const timelineCtx = document.getElementById('timelineChart').getContext('2d');
let timelineChart; // سيتم تهيئة الرسم البياني لاحقاً

// ===============================================================
// 2. الدالة الرئيسية لجلب ومعالجة وعرض البيانات
// ===============================================================
async function loadAndProcessData() {
    try {
        // --- جلب البيانات من Supabase ---
        const { data: visitors, error } = await supabase
            .from('visitors')
            .select('name, created_at')
            .order('created_at', { ascending: false }); // الأحدث أولاً

        if (error) throw error;

        // --- تحديث بطاقة إجمالي الزوار ---
        totalVisitorsElement.textContent = visitors.length;

        // --- تحديث جدول آخر الزوار المسجلين (آخر 5 فقط) ---
        visitorsTableBody.innerHTML = ''; // مسح الجدول القديم
        const recentVisitors = visitors.slice(0, 5); // نأخذ أول 5 زوار
        if (recentVisitors.length === 0) {
            visitorsTableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4">لا يوجد زوار مسجلون بعد.</td></tr>`;
        } else {
            recentVisitors.forEach(visitor => {
                const registrationTime = new Date(visitor.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                const row = `
                    <tr>
                        <td>${visitor.name}</td>
                        <td>${registrationTime}</td>
                    </tr>
                `;
                visitorsTableBody.innerHTML += row;
            });
        }

        // --- معالجة البيانات لإنشاء الرسم البياني (حسب الساعة) ---
        const visitsByHour = {}; // كائن لتجميع عدد الزوار في كل ساعة

        visitors.forEach(visitor => {
            const visitHour = new Date(visitor.created_at).getHours(); // نحصل على الساعة (0-23)
            visitsByHour[visitHour] = (visitsByHour[visitHour] || 0) + 1;
        });

        // إنشاء تسميات للساعات (Labels) وبيانات لكل ساعة
        const chartLabels = [];
        const chartData = [];
        for (let i = 0; i < 24; i++) {
            // تنسيق الساعة لعرضها بشكل جميل (e.g., "08:00 ص")
            const hourLabel = new Date(0, 0, 0, i).toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit', hour12: true });
            chartLabels.push(hourLabel);
            chartData.push(visitsByHour[i] || 0); // إذا لم يوجد زوار في ساعة معينة، نضع 0
        }
        
        // --- تحديث الرسم البياني بالبيانات الجديدة ---
        timelineChart.data.labels = chartLabels;
        timelineChart.data.datasets[0].data = chartData;
        timelineChart.update();

        // --- تحديث وقت آخر تحديث ---
        updateLastUpdateTime();

    } catch (error) {
        console.error('فشل في تحميل البيانات:', error);
    }
}

// ===============================================================
// 3. دوال مساعدة وتهيئة الصفحة
// ===============================================================

// دالة لتهيئة الرسم البياني لأول مرة
function initializeChart() {
    Chart.defaults.color = 'rgba(255, 255, 255, 0.8)';
    timelineChart = new Chart(timelineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{
            label: 'عدد الزوار',
            data: [],
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.4
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

// دالة لتحديث وقت "آخر تحديث"
function updateLastUpdateTime() {
    const now = new Date();
    lastUpdateTimeElement.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===============================================================
// 4. تشغيل كل شيء عند تحميل الصفحة
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();      // 1. جهز الرسم البياني الفارغ
    loadAndProcessData();   // 2. املأه بالبيانات لأول مرة
    setInterval(loadAndProcessData, 30000); // 3. قم بتحديث البيانات كل 30 ثانية
    currentYearElement.textContent = new Date().getFullYear(); // تحديث سنة الحقوق
});
