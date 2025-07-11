import { ref, onMounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { Chart, registerables } from 'chart.js'
import { HealthJournalService } from './HealthJournalService.js'

export default function useHealthCharts() {
  const store = useStore()
  const healthService = new HealthJournalService()

  const sleepChart = ref(null)
  const activityChart = ref(null)
  const moodChart = ref(null)
  const combinedChart = ref(null)

  const timeRange = ref('7')
  const userEntries = ref([])
  const chartInstances = ref({
    sleep: null,
    activity: null,
    mood: null,
    combined: null
  })

  const filteredEntries = computed(() => {
    if (!userEntries.value.length) return []

    const now = new Date()
    let cutoffDate = new Date()

    if (timeRange.value !== 'all') {
      cutoffDate.setDate(now.getDate() - parseInt(timeRange.value))
    } else {
      cutoffDate = new Date(Math.min(...userEntries.value.map(e => new Date(e.date))))
    }

    return userEntries.value
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  const loadUserData = async () => {
    if (store.state.user) {
      userEntries.value = await healthService.getUserEntries(store.state.user.username)
      userEntries.value = groupEntriesByDate(userEntries.value)
      updateCharts()
    }
  }

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

    return Object.values(grouped).map(entry => ({
      ...entry,
      mood: entry.moodCount > 0 ? Math.round(entry.mood / entry.moodCount) : null
    }))
  }

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const updateCharts = () => {
    if (!filteredEntries.value.length) return

    const dates = filteredEntries.value.map(entry => formatDateLabel(entry.date))
    const sleepData = filteredEntries.value.map(entry => entry.sleep || 0)
    const activityData = filteredEntries.value.map(entry => entry.activity || 0)
    const moodData = filteredEntries.value.map(entry => entry.mood || 0)

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

  const renderChart = (chartName, canvas, { labels, data, label, color, type }) => {
    Chart.register(...registerables)

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
