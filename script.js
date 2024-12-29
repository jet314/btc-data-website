let updateIntervalValue = 30; 
let currency = 'usd'; 
let theme = 'light'; 
let btcChart; 

function formatCurrency(value) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(value);
}

function setupChart() {
    const ctx = document.getElementById('btcChart').getContext('2d');
    btcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'BTC Open Price',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.1
            },
            {
                label: 'BTC High Price',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            },
            {
                label: 'BTC Low Price',
                data: [],
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true,
                tension: 0.1
            },
            {
                label: 'BTC Close Price',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
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
        }
    });
}

async function fetchBTCData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=${currency}&days=1`);
        const data = await response.json();

        if (!data || data.length === 0) {
            console.error('Data is empty or in invalid format.');
            return;
        }

        let totalOpen = 0, totalHigh = 0, totalLow = 0, totalClose = 0, count = 0;
        const tableBody = document.querySelector('#btcTable tbody');
        tableBody.innerHTML = ''; 

        data.forEach(item => {
            const [timestamp, open, high, low, close] = item;

            totalOpen += open;
            totalHigh += high;
            totalLow += low;
            totalClose += close;
            count++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="open">${formatCurrency(open)}</td>
                <td class="high">${formatCurrency(high)}</td>
                <td class="low">${formatCurrency(low)}</td>
                <td class="close">${formatCurrency(close)}</td>
            `;
            tableBody.appendChild(row);
        });

        const averageOpen = totalOpen / count;
        const averageHigh = totalHigh / count;
        const averageLow = totalLow / count;
        const averageClose = totalClose / count;

        const averageElement = document.getElementById('average');
        averageElement.innerHTML = `
            <span>Open: ${formatCurrency(averageOpen)}</span>
            <span>High: ${formatCurrency(averageHigh)}</span>
            <span>Low: ${formatCurrency(averageLow)}</span>
            <span>Close: ${formatCurrency(averageClose)}</span>
        `;

        updateChart(data);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateChart(data) {
    const labels = [];
    const openPrices = [];
    const highPrices = [];
    const lowPrices = [];
    const closePrices = [];

    data.forEach(item => {
        const time = new Date(item[0]).toLocaleTimeString();
        labels.push(time);
        openPrices.push(item[1]);
        highPrices.push(item[2]);
        lowPrices.push(item[3]);
        closePrices.push(item[4]);
    });

    btcChart.data.labels = labels;
    btcChart.data.datasets[0].data = openPrices;
    btcChart.data.datasets[1].data = highPrices;
    btcChart.data.datasets[2].data = lowPrices;
    btcChart.data.datasets[3].data = closePrices;
    btcChart.update();
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    const tablinks = document.getElementsByClassName('tablink');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

function updateInterval() {
    const newInterval = document.getElementById('updateInterval').value;
    updateIntervalValue = parseInt(newInterval);
    clearInterval(window.updateIntervalID);
    window.updateIntervalID = setInterval(fetchBTCData, updateIntervalValue * 1000);
}

function updateCurrency() {
    currency = document.getElementById('currency').value;
    fetchBTCData();
}

function updateTheme() {
    theme = document.getElementById('theme').value;
    if (theme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
}

function filterColumn() {
    const selectedColumn = document.getElementById('dataColumn').value;
    const rows = document.querySelectorAll('#btcTable tbody tr');
    const headers = document.querySelectorAll('#btcTable th');

    headers.forEach(header => header.style.display = 'none');
    rows.forEach(row => {
        row.querySelectorAll('td').forEach(cell => cell.style.display = 'none');
    });

    if (selectedColumn === 'all') {
        headers.forEach(header => header.style.display = 'table-cell');
        rows.forEach(row => {
            row.querySelectorAll('td').forEach(cell => cell.style.display = 'table-cell');
        });
    } else {
        const selectedColumnIndex = {
            'open': 0,
            'high': 1,
            'low': 2,
            'close': 3
        }[selectedColumn];

        headers[selectedColumnIndex].style.display = 'table-cell';
        rows.forEach(row => {
            row.cells[selectedColumnIndex].style.display = 'table-cell';
        });
    }
}

function updateLanguage() {
    const language = document.getElementById('language').value;

    const texts = {
        en: {
            dataTable: 'Data Table',
            graph: 'Graph',
            selectLanguage: 'Select Language',
            selectCurrency: 'Select Currency',
            updateInterval: 'Update Interval (seconds)',
            selectTheme: 'Select Theme',
            selectColumn: 'Select Column',
            open: 'Open',
            high: 'High',
            low: 'Low',
            close: 'Close',
        },
        id: {
            dataTable: 'Tabel Data',
            graph: 'Grafik',
            selectLanguage: 'Pilih Bahasa',
            selectCurrency: 'Pilih Mata Uang',
            updateInterval: 'Interval Pembaruan (detik)',
            selectTheme: 'Pilih Tema',
            selectColumn: 'Pilih Kolom',
            open: 'Buka',
            high: 'Tinggi',
            low: 'Rendah',
            close: 'Tutup',
        }
    };

    document.querySelectorAll('.tablink')[0].textContent = texts[language].dataTable;
    document.querySelectorAll('.tablink')[1].textContent = texts[language].graph;
    document.querySelector('label[for="language"]').textContent = texts[language].selectLanguage;
    document.querySelector('label[for="currency"]').textContent = texts[language].selectCurrency;
    document.querySelector('label[for="updateInterval"]').textContent = texts[language].updateInterval;
    document.querySelector('label[for="theme"]').textContent = texts[language].selectTheme;
    document.querySelector('label[for="dataColumn"]').textContent = texts[language].selectColumn;

    const headers = document.querySelectorAll('#btcTable th');
    headers[0].textContent = texts[language].open;
    headers[1].textContent = texts[language].high;
    headers[2].textContent = texts[language].low;
    headers[3].textContent = texts[language].close;
}

setupChart();
fetchBTCData();
window.updateIntervalID = setInterval(fetchBTCData, updateIntervalValue * 1000);
