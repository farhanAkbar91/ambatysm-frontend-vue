<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <h1>AMBATYSM</h1>
        <span>Admin Portal</span>
      </div>
      <nav class="nav-menu" id="sidebarNav">
        <router-link to="/admin/dashboard" class="nav-item" exact-active-class="active">
          <i class="bi bi-speedometer2"></i> Dashboard
        </router-link>
        <router-link to="/admin" class="nav-item">
          <i class="bi bi-box-seam"></i> Produk
        </router-link>
        <router-link to="/admin/pesanan" class="nav-item">
          <i class="bi bi-receipt"></i> Pesanan
        </router-link>
        <router-link to="/admin/profil" class="nav-item">
          <i class="bi bi-person-gear"></i> Profil
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/admin/tambah-produk" class="btn-launch text-decoration-none">
          <i class="bi bi-plus-lg"></i> Tambah Produk Baru
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input type="text" v-model="searchQuery" placeholder="Cari data analitik, produk, atau pesanan..." @keyup.enter="handleSearch">
        </div>
        <div class="header-actions">
          <div class="notification" @click="handleNotif">
            <i class="bi bi-bell"></i>
            <div class="notification-dot" v-if="hasNotif"></div>
          </div>
          <router-link to="/admin/profil" class="profile">
            <div class="profile-info">
              <div class="profile-name">{{ auth.user?.name || 'Admin Ambatysm' }}</div>
              <div class="profile-role">Owner</div>
            </div>
            <div class="profile-img">
              <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user?.name || 'Admin Ambatysm')}&background=dc2626&color=fff`" alt="Admin">
            </div>
          </router-link>
        </div>
      </header>

      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div>
          <p>Halo, selamat datang di Dashboard Admin Ambatysm!</p>
          <p style="font-size: 12px; color: var(--text-secondary); font-weight: 400; margin-top: 4px;">Pantau performa penjualan dan kelola produk Anda dengan mudah.</p>
        </div>
        <router-link to="/admin">Kelola Produk &rarr;</router-link>
      </div>

      <!-- Section Title & Filters -->
      <div class="section-header">
        <h2 class="section-title">Ringkasan Penjualan</h2>
        <div class="filters-group">
          <select class="filter-select" v-model="filterTanggal" @change="updateDashboardData">
            <option value="all">Semua Tanggal</option>
            <option v-for="i in 31" :key="i" :value="i">{{ i }}</option>
          </select>
          <select class="filter-select" v-model="filterBulan" @change="updateDashboardData">
            <option value="all">Semua Bulan</option>
            <option v-for="(b, i) in bulanNames" :key="i" :value="i+1">{{ b }}</option>
          </select>
          <select class="filter-select" v-model="filterTahun" @change="updateDashboardData">
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <!-- Metrics Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Big Metric: Pendapatan -->
        <div class="panel">
          <div class="big-metric">
            <div class="metric-title">Total Pendapatan</div>
            <div class="metric-value">{{ formatRupiah(valPendapatan) }}</div>
            <div class="metric-trend trend-up">
              <i class="bi bi-arrow-up"></i> 15%
            </div>
          </div>
        </div>

        <!-- Small Metrics -->
        <div class="panel p-0" style="padding: 24px;">
          <div class="small-metrics-grid">
            <div class="small-metric">
              <div class="metric-title">Total Transaksi</div>
              <div class="metric-value">{{ valTransaksi.toLocaleString('id-ID') }}</div>
              <div class="metric-trend trend-text-up">
                <i class="bi bi-arrow-up"></i> 12%
              </div>
            </div>
            <div class="small-metric">
              <div class="metric-title">Produk Terjual</div>
              <div class="metric-value">{{ valProduk.toLocaleString('id-ID') }}</div>
              <div class="metric-trend trend-text-up">
                <i class="bi bi-arrow-up"></i> 8.5%
              </div>
            </div>
            <div class="small-metric">
              <div class="metric-title">Total Order Dibatalkan</div>
              <div class="metric-value">{{ valBatal.toLocaleString('id-ID') }}</div>
              <div class="metric-trend trend-text-down">
                <i class="bi bi-arrow-down"></i> 2.1%
              </div>
            </div>
            <div class="small-metric">
              <div class="metric-title">Customer Aktif</div>
              <div class="metric-value">{{ valCustomer.toLocaleString('id-ID') }}</div>
              <div class="metric-trend trend-text-up">
                <i class="bi bi-arrow-up"></i> 18%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="panel">
        <div class="chart-header">
          <h3 class="chart-title">Grafik Penjualan</h3>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-dot" style="background-color: var(--accent-red);"></div>
              Total Penjualan
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background-color: #10b981;"></div>
              Total Transaksi
            </div>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas ref="salesChartCanvas"></canvas>
        </div>
      </div>

      <!-- Top Selling -->
      <div class="bottom-grid">
        <div class="panel">
          <div class="chart-header" style="margin-bottom: 0;">
            <h3 class="chart-title">Produk Terlaris</h3>
            <router-link to="/admin" style="font-size: 13px; color: var(--accent-red); font-weight: 600; text-decoration: none;">Lihat Semua &rarr;</router-link>
          </div>
          <div class="product-list" v-if="topProducts.length > 0">
            <div class="product-item" v-for="product in topProducts" :key="product.id" @click="router.push('/admin')">
              <img :src="product.image ? `${ASSET_URL}/storage/${product.image}` : 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80'" :alt="product.name" class="product-img">
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-meta">
                  <span>Terjual: {{ product.total_sold }}</span>
                  <span class="product-price">{{ formatRupiah(product.price) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="margin-top: 16px; color: var(--text-secondary); font-size: 14px;">Belum ada data produk terlaris pada periode ini.</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import { BASE_URL, ASSET_URL } from '../../composables/api'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const searchQuery = ref('')
const hasNotif = ref(true)

const filterTanggal = ref('all')
const filterBulan = ref('5')
const filterTahun = ref('2026')
const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

const valPendapatan = ref(0)
const valTransaksi = ref(0)
const valProduk = ref(0)
const valBatal = ref(0)
const valCustomer = ref(0)

const topProducts = ref([])

const salesChartCanvas = ref(null)
let chartInstance = null

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  
  Chart.defaults.font.family = "'Inter', sans-serif"
  Chart.defaults.color = '#6b7280'

  chartInstance = new Chart(salesChartCanvas.value, {
    type: 'line',
    data: {
      labels: Array.from({length: 31}, (_, i) => (i + 1).toString()),
      datasets: [
        {
          label: 'Total Penjualan (Juta)',
          data: [5, 8, 4, 6, 12, 10, 15, 18, 14, 20, 22, 18, 25, 28, 24, 30, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70],
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#dc2626',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Total Transaksi',
          data: [10, 15, 12, 18, 20, 18, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85],
          borderColor: '#10b981',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#fff',
          bodyColor: '#e5e7eb',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) label += ': '
              if (context.datasetIndex === 0) {
                label += 'Rp ' + context.parsed.y + ' Juta'
              } else {
                label += context.parsed.y
              }
              return label
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false, drawBorder: false } },
        y: { grid: { borderDash: [5, 5], color: '#e5e7eb', drawBorder: false }, beginAtZero: true }
      },
      interaction: { mode: 'index', intersect: false }
    }
  })

  await fetchDashboardData()
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})

async function fetchDashboardData() {
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard-stats?tanggal=${filterTanggal.value}&bulan=${filterBulan.value}&tahun=${filterTahun.value}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Accept': 'application/json'
      }
    })
    
    if (!res.ok) throw new Error('Failed to fetch data')
    
    const data = await res.json()
    valPendapatan.value = data.valPendapatan || 0
    valTransaksi.value = data.valTransaksi || 0
    valProduk.value = data.valProduk || 0
    valBatal.value = data.valBatal || 0
    valCustomer.value = data.valCustomer || 0
    topProducts.value = data.topProducts || []

    if (chartInstance) {
      // For simplicity, we assume day labels for all specific month views, and month labels if 'all' is selected. 
      // If 'all' months is selected, backend should ideally return 12 months data. But our backend currently returns daily if month is specific, otherwise empty.
      // We will map whatever we got. If it's a 31 array, we use 1-31 labels.
      const penjualan = data.chartDataPenjualan || Array(31).fill(0)
      const transaksi = data.chartDataTransaksi || Array(31).fill(0)

      // Normalize data to millions for 'Total Penjualan' to match label or just leave as is.
      // Better to divide by 1000000 to match the 'Juta' label if we want.
      const penjualanJuta = penjualan.map(v => v / 1000000)

      chartInstance.data.datasets[0].data = penjualanJuta
      chartInstance.data.datasets[1].data = transaksi
      chartInstance.update()
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    toast.error('Gagal', 'Tidak dapat mengambil data dashboard.')
  }
}

async function updateDashboardData() {
  const txtTgl = filterTanggal.value === 'all' ? 'Semua Tanggal' : `Tanggal ${filterTanggal.value}`
  const txtBln = filterBulan.value === 'all' ? 'Semua Bulan' : bulanNames[parseInt(filterBulan.value) - 1]
  
  await fetchDashboardData()
  
  toast.success('Diperbarui', `Data untuk: ${txtTgl}, ${txtBln} ${filterTahun.value}`)
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    toast.info('Mencari', `Mencari: "${searchQuery.value}"...`)
    searchQuery.value = ''
  }
}

function handleNotif() {
  if (hasNotif.value) {
    hasNotif.value = false
    toast.info('Notifikasi', 'Anda memiliki 3 pesanan baru masuk.')
  } else {
    toast.info('Notifikasi', 'Tidak ada notifikasi baru.')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.dashboard-wrapper {
  --bg-main: #f4f6f8;
  --bg-panel: #ffffff;
  --bg-sidebar: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent-red: #dc2626;
  --accent-red-hover: #b91c1c;
  --accent-red-light: #fee2e2;
  --border-color: #e5e7eb;
  --trend-up: #10b981;
  --trend-down: #ef4444;
  --bg-trend-up: #d1fae5;
  --bg-trend-down: #fee2e2;
  --font-main: 'Inter', sans-serif;

  font-family: var(--font-main);
  background-color: var(--bg-main);
  color: var(--text-primary);
  display: flex;
  min-height: 100vh;
  text-align: left;
}

.sidebar {
  width: 260px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.brand { padding: 32px 24px; display: flex; flex-direction: column; }
.brand h1 { color: var(--accent-red); font-size: 26px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
.brand span { color: var(--text-secondary); font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; }

.nav-menu { display: flex; flex-direction: column; flex: 1; gap: 8px; padding: 0 16px; }
.nav-item {
  display: flex; align-items: center; gap: 14px; padding: 12px 16px;
  color: var(--text-secondary); text-decoration: none; font-size: 14px;
  font-weight: 600; border-radius: 8px; transition: all 0.2s; position: relative;
}
.nav-item:hover { background-color: #f9fafb; color: var(--text-primary); }
.nav-item.active { background-color: var(--accent-red-light); color: var(--accent-red); }
.nav-item.active::before {
  content: ''; position: absolute; left: -16px; top: 0; height: 100%;
  width: 4px; background-color: var(--accent-red); border-radius: 0 4px 4px 0;
}
.nav-item i { font-size: 20px; }

.sidebar-footer { padding: 24px 16px; }
.btn-launch {
  background-color: var(--accent-red); color: white; border: none; width: 100%;
  padding: 14px; border-radius: 8px; font-weight: 600; font-size: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: background 0.2s;
}
.btn-launch:hover { background-color: var(--accent-red-hover); color: white; }

.main-content {
  margin-left: 260px; flex: 1; padding: 24px 40px; display: flex; flex-direction: column; gap: 24px;
}

.header {
  display: flex; justify-content: space-between; align-items: center;
  background-color: var(--bg-panel); padding: 16px 24px; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-bar {
  display: flex; align-items: center; background-color: var(--bg-main);
  border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 16px;
  width: 400px; transition: border-color 0.2s;
}
.search-bar:focus-within { border-color: var(--accent-red); }
.search-bar i { color: var(--text-secondary); margin-right: 12px; font-size: 18px; }
.search-bar input { background: transparent; border: none; color: var(--text-primary); width: 100%; outline: none; font-size: 14px; }

.header-actions { display: flex; align-items: center; gap: 20px; }
.notification {
  position: relative; cursor: pointer; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background-color: var(--bg-main); transition: background 0.2s;
}
.notification:hover { background-color: #e5e7eb; }
.notification i { font-size: 20px; color: var(--text-secondary); }
.notification-dot {
  position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
  background-color: var(--accent-red); border-radius: 50%; border: 2px solid var(--bg-panel);
}

.profile {
  display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px;
  border-radius: 8px; transition: background 0.2s; text-decoration: none;
}
.profile:hover { background-color: var(--bg-main); }
.profile-info { text-align: right; }
.profile-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.profile-role { font-size: 12px; color: var(--text-secondary); }
.profile-img { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-red-light); }
.profile-img img { width: 100%; height: 100%; object-fit: cover; }

.welcome-banner {
  background-color: var(--accent-red-light); border-left: 4px solid var(--accent-red);
  padding: 16px 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;
}
.welcome-banner p { margin: 0; color: var(--accent-red-hover); font-size: 14px; font-weight: 500; }
.welcome-banner a { color: var(--accent-red); font-weight: 600; font-size: 13px; text-decoration: none; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.section-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
.filters-group { display: flex; gap: 12px; }
.filter-select {
  padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px;
  background-color: var(--bg-panel); color: var(--text-primary); font-size: 13px;
  font-weight: 500; outline: none; cursor: pointer; font-family: var(--font-main);
}
.filter-select:focus { border-color: var(--accent-red); box-shadow: 0 0 0 2px var(--accent-red-light); }

.dashboard-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
.panel {
  background-color: var(--bg-panel); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.big-metric { display: flex; flex-direction: column; justify-content: center; height: 100%; }
.big-metric .metric-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
.big-metric .metric-value { font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
.big-metric .metric-trend {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  border-radius: 20px; font-size: 13px; font-weight: 600; width: fit-content;
}

.small-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; height: 100%; }
.small-metric { display: flex; flex-direction: column; justify-content: center; padding: 16px; border-left: 3px solid var(--border-color); }
.small-metric .metric-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.small-metric .metric-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.small-metric .metric-trend { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }

.trend-up { color: var(--trend-up); background-color: var(--bg-trend-up); }
.trend-down { color: var(--trend-down); background-color: var(--bg-trend-down); }
.trend-text-up { color: var(--trend-up); }
.trend-text-down { color: var(--trend-down); }

.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.chart-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.chart-legend { display: flex; gap: 16px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.chart-wrapper { position: relative; height: 300px; width: 100%; }

.bottom-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
.product-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
.product-item {
  display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid var(--border-color);
  border-radius: 12px; transition: all 0.2s; cursor: pointer; background-color: #fff; text-decoration: none;
}
.product-item:hover { border-color: var(--accent-red); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.05); }
.product-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
.product-info { flex: 1; }
.product-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.product-meta { font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px; }
.product-price { font-weight: 700; color: var(--accent-red); }
</style>
