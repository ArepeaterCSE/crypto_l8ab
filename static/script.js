let cryptoData = [];
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    // تحديث البيانات كل دقيقة
    setInterval(fetchData, 60000);
});

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        cryptoData = await res.json();
        renderList(cryptoData);
        
        // عرض أول عملة في الرسم البياني تلقائياً عند التحميل
        if (!myChart && cryptoData.length > 0) {
            loadCoinDetails(cryptoData[0]);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('coin-list').innerHTML = '<p style="text-align:center; padding:20px; color:red">Error loading market data.</p>';
    }
}

function renderList(data) {
    const list = document.getElementById('coin-list');
    list.innerHTML = '';

    data.forEach(coin => {
        const change = coin.price_change_percentage_24h;
        const colorClass = change >= 0 ? 'text-green' : 'text-red';
        const sign = change >= 0 ? '+' : '';

        const row = document.createElement('div');
        row.className = 'coin-row';
        row.onclick = () => loadCoinDetails(coin); // عند الضغط، اعرض التفاصيل

        row.innerHTML = `
            <div class="coin-name">
                <img src="${coin.image}" alt="${coin.symbol}">
                <div>
                    ${coin.name} <span class="symbol">${coin.symbol.toUpperCase()}</span>
                </div>
            </div>
            <div style="font-family:'Roboto Mono'">$${coin.current_price.toLocaleString()}</div>
            <div class="${colorClass}" style="font-family:'Roboto Mono'">${sign}${change.toFixed(2)}%</div>
            <div style="font-family:'Roboto Mono'">$${(coin.market_cap / 1000000).toFixed(0)}M</div>
        `;
        list.appendChild(row);
    });
}

function filterCoins() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = cryptoData.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.symbol.toLowerCase().includes(query)
    );
    renderList(filtered);
}

function loadCoinDetails(coin) {
    // إظهار قسم الرسم البياني
    document.getElementById('chartSection').style.display = 'block';
    
    // تحديث النصوص
    document.getElementById('detail-name').innerText = coin.name;
    document.getElementById('detail-symbol').innerText = coin.symbol.toUpperCase();
    document.getElementById('detail-img').src = coin.image;
    document.getElementById('detail-price').innerText = `$${coin.current_price.toLocaleString()}`;
    
    const change = coin.price_change_percentage_24h;
    const changeEl = document.getElementById('detail-change');
    changeEl.innerText = `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (24H)`;
    changeEl.className = change >= 0 ? 'text-green' : 'text-red';

    // رسم الشارت
    drawChart(coin);
    
    // سكرول للأعلى بجمالية
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function drawChart(coin) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // بيانات وهمية للرسم (CoinGecko Sparkline) لتبسيط الـ Demo
    // في النسخة الكاملة يمكن استخدام التواريخ الحقيقية
    const prices = coin.sparkline_in_7d.price;
    const labels = prices.map((_, i) => i); // مجرد أرقام للتسلسل

    if (myChart) myChart.destroy(); // حذف الرسم القديم

    const color = coin.price_change_percentage_24h >= 0 ? '#0ecb81' : '#f6465d';

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price (7 Days)',
                data: prices,
                borderColor: color,
                borderWidth: 2,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                    gradient.addColorStop(0, color + '44'); // لون شفاف
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    return gradient;
                },
                fill: true,
                pointRadius: 0, // إخفاء النقاط ليكون خطاً ناعماً
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false }, // إخفاء محور X
                y: { 
                    display: true,
                    grid: { color: '#222' },
                    ticks: { color: '#666' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });
}

// تفعيل البحث عند الكتابة
document.getElementById('searchInput').addEventListener('keyup', filterCoins);
