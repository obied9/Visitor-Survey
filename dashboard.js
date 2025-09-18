// ===============================================================
// 1. الإعدادات الأساسية ومفاتيح الربط
// ===============================================================
const SUPABASE_URL = 'https://vlbtzwebjfsbniqcsmpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnR6d2ViamZzYm5pcWNzbXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzk1MDgsImV4cCI6MjA3Mzc1NTUwOH0.CsU1jqblx93GK8b-Rgla2s2K-4uxtaH7JyPMSjar73M';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// استهداف العناصر في صفحة HTML
const totalVisitorsElement = document.getElementById('total-visitors');
const visitorsTableBody = document.getElementById('visitors-table-body');
const lastUpdateTimeElement = document.getElementById('lastUpdateTime');
const currentYearElement = document.getElementById('currentYear');
const timelineCtx = document.getElementById('timelineChart').getContext('2d');
let timelineChart;

// ===============================================================
// 2. الدالة الرئيسية لجلب ومعالجة وعرض البيانات (النسخة المحسّنة)
// ===============================================================
async function loadAndProcessData() {
    try {
        // --- التحسين 1: جلب العدد الإجمالي وآخر 500 سجل فقط ---
        const { data: visitors, error, count } = await supabase
            .from('visitors')
            .select('*', { count: 'exact' }) // اطلب العدد الإجمالي الدقيق
            .order('created_at', { ascending: false }) // رتب الأحدث أولاً
            .limit(500); // اجلب آخر 500 سجل فقط

        if (error) throw error;

        // --- التحسين 2: استخدام "count" لعرض العدد الإجمالي الصحيح ---
        totalVisitorsElement.textContent = count;

        // --- تحديث جدول آخر الزوار المسجلين (آخر 5 فقط) ---
        visitorsTableBody.innerHTML = ''; // مسح الجدول القديم
        const recentVisitors = visitors.slice(0, 5);
        
        if (recentVisitors.length === 0) {
            visitorsTableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4">لا يوجد زوار مسجلون بعد.</td></tr>`;
        } else {
            recentVisitors.forEach(visitor => {
                const formattedId = visitor.ticket_id ? "vs" + visitor.ticket_id : "---";
                const registrationTime = new Date(visitor.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${formattedId}</strong></td>
                    <td>${visitor.name}</td>
                    <td>${registrationTime}</td>
                `;
                visitorsTableBody.appendChild(row);
            });
        }

        // --- معالجة البيانات لإنشاء الرسم البياني (بناءً على آخر 500 زائر) ---
        const visitsByHour = {};
        visitors.forEach(visitor => {
            const visitHour = new Date(visitor.created_at).getHours();
            visitsByHour[visitHour] = (visitsByHour[visitHour] || 0) + 1;
        });

        const chartLabels = [];
        const chartData = [];
        for (let i = 0; i < 24; i++) {
            const hourLabel = new Date(0, 0, 0, i).toLocaleTimeString('ar-SA', { hour: '2-digit', minute:'2-digit', hour12: true });
            chartLabels.push(hourLabel);
            chartData.push(visitsByHour[i] || 0);
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

function updateLastUpdateTime() {
    const now = new Date();
    lastUpdateTimeElement.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===============================================================
// 4. تشغيل كل شيء عند تحميل الصفحة
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    loadAndProcessData();
    setInterval(loadAndProcessData, 30000); 
    
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});
