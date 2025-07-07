<template>
  <div class="health-charts-page">
    <header class="header">
      <h1>Vos Statistiques de Santé</h1>
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
import useHealthCharts from '../lib/HealthChartScript.js'

export default {
  name: 'HealthCharts',
  setup() {
    return useHealthCharts()
  }
}
</script>


<style scoped>
  @import '@/assets/CSS/HealthCharts.css';
</style>


