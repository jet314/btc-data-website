// Variabel untuk grafik BTC
let btcChart;

// Data yang akan digunakan untuk grafik
let chartData = {
    labels: [],
    datasets: [{
        label: 'BTC Open Price',
        data: [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        tension: 0.1
    },
    {
        label: 'BTC High Price',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1
    },
    {
        label: 'BTC Low Price',
        data: [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: false,
        tension: 0.1
    },
    {
        label: 'BTC Close Price',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0.1
    }]
};

// Konfigurasi grafik
const chartOptions = {
    responsive: true,
    scales: {
        x: {
            type: 'linear',
            position: 'bottom'
        },
        y: {
            beginAtZero: false
        }
    },
    plugins: {
        legend: {
            display: true
        },
        tooltip: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.dataset.label + ': ' + formatCurrency(tooltipItem.raw);
                }
            }
        }
    }
};

// Menyiapkan Grafik dengan Chart.js
function setupChart() {
    const ctx = document.getElementById('btcChart').getContext('2d');
    btcChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// Fungsi untuk memulai pembaruan data secara real-time
function startDataUpdate() {
    clearInterval(intervalId);
    const interval = parseInt(document.getElementById('updateInterval').value) * 1000;

    intervalId = setInterval(fetchData, interval);
    fetchData(); // Memanggil pertama kali saat load
}

// Fungsi untuk mengambil data BTC secara real-time
function fetchData() {
    const currency = document.getElementById('currency').value;
    
    // Contoh API untuk mendapatkan data BTC (gunakan API yang valid)
    fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=1`)
        .then(response => response.json())
        .then(data => {
            updateTable(data.prices); // Memperbarui tabel dengan data baru
            updateChart(data.prices); // Memperbarui grafik dengan data baru
            calculateAverages(data.prices); // Menghitung rata-rata
        })
        .catch(error => console.error("Error fetching data:", error));
}

// Fungsi untuk memperbarui grafik
function updateChart(prices) {
    // Ambil waktu dan harga
    const newLabels = [];
    const newOpen = [];
    const newHigh = [];
    const newLow = [];
    const newClose = [];

    prices.forEach(price => {
        const time = new Date(price[0]).toLocaleTimeString();
        newLabels.push(time);
        newOpen.push(price[1]); // Data Open
        newHigh.push(price[1]); // Data High
        newLow.push(price[1]);  // Data Low
        newClose.push(price[1]); // Data Close
    });

    // Update data untuk grafik
    chartData.labels = newLabels;
    chartData.datasets[0].data = newOpen;
    chartData.datasets[1].data = newHigh;
    chartData.datasets[2].data = newLow;
    chartData.datasets[3].data = newClose;

    btcChart.update(); // Update grafik setelah data diubah
}

// Fungsi untuk menghitung rata-rata
function calculateAverages(prices) {
    const sum = { open: 0, high: 0, low: 0, close: 0 };
    const count = prices.length;

    prices.forEach(price => {
        sum.open += price[1];
        sum.high += price[1];
        sum.low += price[1];
        sum.close += price[1];
    });

    averageOpen.textContent = `Avg Open: ${formatCurrency(sum.open / count)}`;
    averageHigh.textContent = `Avg High: ${formatCurrency(sum.high / count)}`;
    averageLow.textContent = `Avg Low: ${formatCurrency(sum.low / count)}`;
    averageClose.textContent = `Avg Close: ${formatCurrency(sum.close / count)}`;
}

// Fungsi untuk memformat angka menjadi mata uang
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// Fungsi untuk memperbarui tema
function updateTheme() {
    const theme = document.getElementById('theme').value;
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

// Fungsi untuk memperbarui interval pembaruan
function updateInterval() {
    startDataUpdate();
}

// Fungsi untuk memilih kolom yang ditampilkan
function filterColumn() {
    const column = document.getElementById('dataColumn').value;
    let columnsToShow = ['open', 'high', 'low', 'close'];
    if (column !== 'all') {
        columnsToShow = [column];
    }

    document.querySelectorAll('#btcTable th, #btcTable td').forEach(cell => {
        if (columnsToShow.includes(cell.innerText.toLowerCase())) {
            cell.style.display = 'table-cell';
        } else {
            cell.style.display = 'none';
        }
    });
}

startDataUpdate(); // Mulai pembaruan data saat pertama kali
setupChart(); // Setup grafik pertama kali
