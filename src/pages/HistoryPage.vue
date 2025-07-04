<template>
  <div class="history-page">
    <header class="header">
      <h1>Historique Complet</h1>
      <BaseButton @click="$router.push('/')">Retour à l'accueil</BaseButton>
    </header>

    <div class="filters">
      <div class="filter-group">
        <label>Période :</label>
        <select v-model="timeRange" @change="loadEntries">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
          <option value="all">Toutes les données</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Type :</label>
        <select v-model="entryType">
          <option value="all">Toutes les activités</option>
          <option value="sleep">Sommeil</option>
          <option value="activity">Activité</option>
          <option value="mood">Humeur</option>
          <option value="nutrition">Alimentation</option>
        </select>
      </div>
    </div>

    <div class="entries-container">
      <div v-if="isLoading" class="loading">Chargement...</div>
      
      <div v-else-if="filteredEntries.length === 0" class="empty-state">
        Aucune entrée trouvée pour cette période.
      </div>

      <div v-else class="entries-list">
        <div v-for="entry in filteredEntries" :key="entry.date" class="entry-card">
          <div class="entry-date">{{ formatDate(entry.date) }}</div>
          
          <div class="entry-details">
            <div v-if="entry.sleep" class="detail-item">
              <span class="emoji">😴</span>
              <span class="value">{{ entry.sleep }}h</span>
              <span class="label">Sommeil</span>
            </div>
            
            <div v-if="entry.mood" class="detail-item">
              <span class="emoji">😊</span>
              <span class="value">{{ entry.mood }}/10</span>
              <span class="label">Humeur</span>
            </div>
            
            <div v-if="entry.activity" class="detail-item">
              <span class="emoji">🏃</span>
              <span class="value">{{ entry.activity }} min</span>
              <span class="label">Activité</span>
            </div>
            
            <div v-if="entry.nutrition" class="detail-item">
              <span class="emoji">🥗</span>
              <span class="value">{{ entry.nutrition }}</span>
              <span class="label">Alimentation</span>
            </div>
          </div>
          
          <button class="edit-btn" @click="editEntry(entry)">✏️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { HealthJournalService } from '../lib/HealthJournalService.js'

export default {
  name: 'HistoryPage',
  setup() {
    const store = useStore()
    const healthService = new HealthJournalService()
    
    const timeRange = ref('30')
    const entryType = ref('all')
    const isLoading = ref(false)
    const allEntries = ref([])

    const loadEntries = async () => {
      if (!store.state.user) return
      
      isLoading.value = true
      try {
        allEntries.value = await healthService.getUserEntries(store.state.user.username)
      } catch (error) {
        console.error("Erreur de chargement", error)
      } finally {
        isLoading.value = false
      }
    }

    const filteredEntries = computed(() => {
      let entries = [...allEntries.value]
      
      // Filtre par période
      if (timeRange.value !== 'all') {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange.value))
        entries = entries.filter(e => new Date(e.date) >= cutoffDate)
      }
      
      // Filtre par type
      if (entryType.value !== 'all') {
        entries = entries.filter(e => e[entryType.value] !== undefined && e[entryType.value] !== null)
      }
      
      return entries.sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })
    }

    const editEntry = (entry) => {
      // Implémentez la logique d'édition ici
      console.log("Éditer l'entrée", entry)
    }

    onMounted(() => {
      loadEntries()
    })

    return {
      timeRange,
      entryType,
      isLoading,
      filteredEntries,
      loadEntries,
      formatDate,
      editEntry
    }
  }
}
</script>

<style scoped>
  @import '@/assets/CSS/HistoryPage.css';
</style>