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
        <div v-for="entry in filteredEntries" :key="entry.id" class="entry-card">
          <div class="entry-header">
            <div class="entry-date">{{ formatDate(entry.date) }}</div>
            <div class="entry-time" v-if="entry.time">{{ entry.time }}</div>
          </div>
          
          <div class="entry-details">
            <div v-if="entry.sleep" class="detail-item">
              <span class="emoji">😴</span>
              <span class="value">{{ entry.sleep }}h</span>
            </div>
            
            <div v-if="entry.mood" class="detail-item">
              <span class="emoji">😊</span>
              <span class="value">{{ entry.mood }}/10</span>
            </div>
            
            <div v-if="entry.activity" class="detail-item">
              <span class="emoji">🏃</span>
              <span class="value">{{ entry.activity }} min</span>
            </div>
            
            <div v-if="entry.nutrition" class="detail-item">
              <span class="emoji">🥗</span>
              <span class="value">{{ entry.nutrition }}</span>
            </div>
          </div>
          
          <button class="edit-btn" @click="editEntry(entry)">✏️</button>        
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>Modifier l'entrée du {{ formatDate(editingEntry.date) }}</h3>
        <form @submit.prevent="saveEditedEntry">
          <div class="form-group">
            <label>😴 Sommeil (heures)</label>
            <input v-model.number="editingEntry.sleep" type="number" min="0" max="24" step="0.5">
          </div>
          <div class="form-group">
            <label>😊 Humeur (1-10)</label>
            <input v-model.number="editingEntry.mood" type="number" min="1" max="10">
          </div>
          <div class="form-group">
            <label>🏃 Activité (minutes)</label>
            <input v-model.number="editingEntry.activity" type="number" min="0">
          </div>
          <div class="form-group">
            <label>🥗 Alimentation</label>
            <textarea v-model="editingEntry.nutrition"></textarea>
          </div>
          <div class="form-group" v-if="editingEntry.time">
            <label>⏰ Heure</label>
            <input v-model="editingEntry.time" type="time">
          </div>
          <div class="modal-buttons">
            <button type="button" @click="closeEditModal" class="cancel-btn">Annuler</button>
            <button type="button" @click="deleteEntry" class="delete-btn">Supprimer</button>
            <button type="submit" class="save-btn">Enregistrer</button>
          </div>
        </form>
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
    const showEditModal = ref(false)
    const editingEntry = ref(null)

    const loadEntries = async () => {
      if (!store.state.user) return
      
      isLoading.value = true
      try {
        const entries = await healthService.getUserEntries(store.state.user.username)
        // Trier par date et heure décroissantes
        allEntries.value = entries.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
          const dateB = new Date(`${b.date}T${b.time || '00:00'}`)
          return dateB - dateA
        })
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
      
      return entries
    })

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })
    }

    const editEntry = (entry) => {
      editingEntry.value = JSON.parse(JSON.stringify(entry)) // Deep copy
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const saveEditedEntry = async () => {
      try {
        if (editingEntry.value.id) {
          // Mettre à jour l'entrée existante
          await healthService.updateUserEntry(store.state.user.username, editingEntry.value);
        } else {
          // Créer une nouvelle entrée
          await healthService.saveUserEntry(store.state.user.username, editingEntry.value);
        }
        await loadEntries();
        closeEditModal();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde", error);
        alert("Erreur lors de la sauvegarde: " + error.message);
      }
    };

    const deleteEntry = async () => {
      if (confirm("Voulez-vous vraiment supprimer cette entrée ?")) {
        try {
          await healthService.deleteUserEntry(store.state.user.username, editingEntry.value);
          await loadEntries();
          closeEditModal();
        } catch (error) {
          console.error("Erreur lors de la suppression", error);
          alert("Erreur lors de la suppression: " + error.message);
        }
      }
    };

    onMounted(() => {
      loadEntries()
    })

    return {
      timeRange,
      entryType,
      isLoading,
      filteredEntries,
      showEditModal,
      editingEntry,
      loadEntries,
      formatDate,
      editEntry,
      closeEditModal,
      saveEditedEntry,
      deleteEntry
    }
  }
}
</script>

<style scoped>
  @import '@/assets/CSS/HistoryPage.css';
</style>