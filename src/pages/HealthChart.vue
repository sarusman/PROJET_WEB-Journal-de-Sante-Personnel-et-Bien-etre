<template>
  <div class="health-charts-page">
    <header class="header">
      <h1>Vos Statistiques de Santé</h1>
      <BaseButton @click="$router.push('/')">Retour à l'accueil</BaseButton>
    </header>

    <div class="chart-filters">
      <div class="filter-group">
        <label>Période :</label>
        <select v-model="timeRange" @change="updateCharts">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
          <option value="all">Toutes les données</option>
        </select>
      </div>
    </div>

    <div class="charts-container">
      <!-- Graphique de sommeil -->
      <div class="chart-card">
        <h2>Sommeil (heures)</h2>
        <canvas ref="sleepChart"></canvas>
      </div>

      <!-- Graphique d'activité -->
      <div class="chart-card">
        <h2>Activité (minutes)</h2>
        <canvas ref="activityChart"></canvas>
      </div>

      <!-- Graphique d'humeur -->
      <div class="chart-card">
        <h2>Humeur (1-10)</h2>
        <canvas ref="moodChart"></canvas>
      </div>

      <!-- Graphique combiné -->
      <div class="chart-card full-width">
        <h2>Synthèse</h2>
        <canvas ref="combinedChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { Chart, registerables } from 'chart.js'
import { HealthJournalService } from '../lib/HealthJournalService.js'

export default {
  name: 'HealthCharts',
  setup() {
    const store = useStore()
    const healthService = new HealthJournalService()
    
    // Références pour les canvas
    const sleepChart = ref(null)
    const activityChart = ref(null)
    const moodChart = ref(null)
    const combinedChart = ref(null)
    
    // Variables réactives
    const timeRange = ref('7')
    const userEntries = ref([])
    const chartInstances = ref({
      sleep: null,
      activity: null,
      mood: null,
      combined: null
    })

    // Données filtrées selon la période sélectionnée
    const filteredEntries = computed(() => {
      if (!userEntries.value.length) return []
      
      const now = new Date()
      let cutoffDate = new Date()
      
      if (timeRange.value !== 'all') {
        cutoffDate.setDate(now.getDate() - parseInt(timeRange.value))
      } else {
        // Pour "toutes les données", on prend la date la plus ancienne
        cutoffDate = new Date(Math.min(...userEntries.value.map(e => new Date(e.date))))
      }
      
      return userEntries.value
        .filter(entry => new Date(entry.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    // Charger les données utilisateur
    const loadUserData = async () => {
      if (store.state.user) {
        userEntries.value = await healthService.getUserEntries(store.state.user.username)
        // Grouper les entrées par date (au cas où il y aurait plusieurs entrées par jour)
        userEntries.value = groupEntriesByDate(userEntries.value)
        updateCharts()
      }
    }

    // Grouper les entrées par date et cumuler les valeurs
    const groupEntriesByDate = (entries) => {
      const grouped = {}
      
      entries.forEach(entry => {
        if (!grouped[entry.date]) {
          grouped[entry.date] = {
            date: entry.date,
            sleep: 0,
            activity: 0,
            mood: 0,
            moodCount: 0,
            nutrition: []
          }
        }
        
        if (entry.sleep) grouped[entry.date].sleep += entry.sleep
        if (entry.activity) grouped[entry.date].activity += entry.activity
        if (entry.mood) {
          grouped[entry.date].mood += entry.mood
          grouped[entry.date].moodCount++
        }
        if (entry.nutrition) grouped[entry.date].nutrition.push(entry.nutrition)
      })
      
      // Calculer la moyenne pour l'humeur
      return Object.values(grouped).map(entry => ({
        ...entry,
        mood: entry.moodCount > 0 ? Math.round(entry.mood / entry.moodCount) : null
      }))
    }

    // Formater les dates pour l'affichage
    const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }

    // Mettre à jour tous les graphiques
    const updateCharts = () => {
      if (!filteredEntries.value.length) return
      
      const dates = filteredEntries.value.map(entry => formatDateLabel(entry.date))
      
      // Données pour le sommeil
      const sleepData = filteredEntries.value.map(entry => entry.sleep || 0)
      
      // Données pour l'activité
      const activityData = filteredEntries.value.map(entry => entry.activity || 0)
      
      // Données pour l'humeur
      const moodData = filteredEntries.value.map(entry => entry.mood || 0)
      
      // Mettre à jour ou créer les graphiques
      renderChart('sleep', sleepChart.value, {
        labels: dates,
        data: sleepData,
        label: 'Heures de sommeil',
        color: '#42b983',
        type: 'bar'
      })
      
      renderChart('activity', activityChart.value, {
        labels: dates,
        data: activityData,
        label: 'Minutes d\'activité',
        color: '#2c3e50',
        type: 'bar'
      })
      
      renderChart('mood', moodChart.value, {
        labels: dates,
        data: moodData,
        label: 'Humeur (1-10)',
        color: '#ff5722',
        type: 'line'
      })
      
      renderCombinedChart(dates, sleepData, activityData, moodData)
    }

    // Créer ou mettre à jour un graphique
    const renderChart = (chartName, canvas, { labels, data, label, color, type }) => {
      Chart.register(...registerables)
      
      // Détruire le graphique existant s'il y en a un
      if (chartInstances.value[chartName]) {
        chartInstances.value[chartName].destroy()
      }
      
      const ctx = canvas.getContext('2d')
      chartInstances.value[chartName] = new Chart(ctx, {
        type: type,
        data: {
          labels: labels,
          datasets: [{
            label: label,
            data: data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }

    // Créer le graphique combiné
    const renderCombinedChart = (labels, sleepData, activityData, moodData) => {
      Chart.register(...registerables)
      
      if (chartInstances.value.combined) {
        chartInstances.value.combined.destroy()
      }
      
      const ctx = combinedChart.value.getContext('2d')
      chartInstances.value.combined = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Sommeil (heures)',
              data: sleepData,
              borderColor: '#42b983',
              backgroundColor: 'rgba(66, 185, 131, 0.1)',
              yAxisID: 'y',
              tension: 0.3
            },
            {
              label: 'Activité (minutes)',
              data: activityData,
              borderColor: '#2c3e50',
              backgroundColor: 'rgba(44, 62, 80, 0.1)',
              yAxisID: 'y1',
              tension: 0.3
            },
            {
              label: 'Humeur (1-10)',
              data: moodData,
              borderColor: '#ff5722',
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              yAxisID: 'y2',
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'Sommeil (heures)' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Activité (minutes)' }
            },
            y2: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Humeur (1-10)' },
              min: 0,
              max: 10
            }
          }
        }
      })
    }



    onMounted(async () => {
      await loadUserData()
    })

    watch(() => store.state.user, (newUser) => {
      if (newUser) loadUserData()
    })

    return {
      sleepChart,
      activityChart,
      moodChart,
      combinedChart,
      timeRange,
      updateCharts
    }
  }
}
</script>

<style scoped>
.health-charts-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.chart-filters {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
}

select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #2c3e50;
}

.full-width {
  grid-column: 1 / -1;
}

canvas {
  width: 100%;
  height: 300px;
}
</style>