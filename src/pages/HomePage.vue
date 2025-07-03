<template>
  <div class="page-container">
    <!-- Actions rapides -->
    <div v-if="currentUser" class="top-actions">
      <div class="action-buttons-top">
        <AsyncButton color="primary" @click="newEntry">📝 Nouvelle entrée</AsyncButton>
        <AsyncButton color="success" @click="viewCharts">📊 Voir graphiques</AsyncButton>
        <AsyncButton color="info" @click="viewHistory">📅 Historique</AsyncButton>
      </div>
    </div>

    <div v-if="currentUser" class="user-welcome">
      <h2>Bonjour {{ currentUser.name }} 👋</h2>
      <p>Prêt à enregistrer votre journée ?</p>
    </div>

    <main class="main-content">
      <div v-if="!currentUser" class="welcome-section">
        <div class="hero">
          <h2>Suivez votre bien-être au quotidien</h2>
          <p>Enregistrez votre sommeil, votre humeur, vos activités et votre alimentation pour améliorer votre santé.</p>
          <div class="features-grid">
            <div class="feature-card">😴 <h3>Sommeil</h3><p>Suivez vos heures de coucher</p></div>
            <div class="feature-card">😊 <h3>Humeur</h3><p>Évaluez votre état d'esprit</p></div>
            <div class="feature-card">🏃 <h3>Activité</h3><p>Enregistrez vos exercices</p></div>
            <div class="feature-card">🥗 <h3>Alimentation</h3><p>Notez vos repas</p></div>
          </div>
        </div>
      </div>

      <div v-else class="dashboard">
        <div class="today-summary">
          <h3>Résumé d'aujourd'hui</h3>
          <div class="summary-cards">
            <div class="summary-card">
              😴 <h4>Sommeil</h4>
              <p>{{ getTodayData('sleep') || 'Pas encore enregistré' }}</p>
            </div>
            <div class="summary-card">
              😊 <h4>Humeur</h4>
              <p>{{ getTodayData('mood') || 'Non renseigné' }}</p>
            </div>
            <div class="summary-card">
              🏃 <h4>Activité</h4>
              <p>{{ getTodayData('activity') || 'Non renseigné' }}</p>
            </div>
            <div class="summary-card">
              🥗 <h4>Alimentation</h4>
              <p>{{ getTodayData('nutrition') || 'Non renseigné' }}</p>
            </div>
          </div>
        </div>

        <div class="recent-entries">
          <h3>Dernière activité</h3>
          <div v-if="recentEntries.length === 0" class="empty-state">
            Aucune activité enregistrée.
          </div>
          <div v-else class="entries-list">
            <div class="entry-item highlight">
              <strong>{{ formatDate(recentEntries[0].date) }}</strong>
              <div>
                <span v-if="recentEntries[0].sleep">😴 {{ recentEntries[0].sleep }}h</span>
                <span v-if="recentEntries[0].mood">😊 {{ recentEntries[0].mood }}/10</span>
                <span v-if="recentEntries[0].activity">🏃 {{ recentEntries[0].activity }} min</span>
                <span v-if="recentEntries[0].nutrition">🥗 {{ recentEntries[0].nutrition }}</span>
              </div>
            </div>
            <button @click="viewHistory" class="view-all">
              Voir l'historique complet →
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showEntryModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>Nouvelle entrée - {{ formatDate(new Date()) }}</h3>
        <form @submit.prevent="saveEntry">
          <div class="form-group">
            <label>😴 Sommeil (heures)</label>
            <input v-model="newEntryData.sleep" type="number" min="0" max="24" step="0.5" placeholder="8">
          </div>
          <div class="form-group">
            <label>😊 Humeur (1-10)</label>
            <input v-model="newEntryData.mood" type="number" min="1" max="10" placeholder="7">
          </div>
          <div class="form-group">
            <label>🏃 Activité (minutes)</label>
            <input v-model="newEntryData.activity" type="number" min="0" placeholder="30">
          </div>
          <div class="form-group">
            <label>🥗 Alimentation</label>
            <textarea v-model="newEntryData.nutrition" placeholder="Décrivez vos repas..."></textarea>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="closeModal">Annuler</button>
            <button type="submit">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import AsyncButton from '../components/AsyncButton.vue'
import { HealthJournalService } from '../lib/HealthJournalService.js'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  components: { AsyncButton },
  setup() {
    const store = useStore()
    const router = useRouter()
    const currentUser = computed(() => store.state.user)
    const showEntryModal = ref(false)
    const userEntries = ref([])
    const newEntryData = ref({
      sleep: '',
      mood: '',
      activity: '',
      nutrition: ''
    })
    const healthService = new HealthJournalService()

    const loadUserData = async () => {
      if (currentUser.value) {
        userEntries.value = await healthService.getUserEntries(currentUser.value.username)
      }
    }

    onMounted(async () => {
      if (currentUser.value) {
        await loadUserData()
      }
    })

    const saveEntry = async () => {
      if (!currentUser.value) return

      const today = new Date().toISOString().split("T")[0]
      const entry = {
        date: today,
        sleep: newEntryData.value.sleep ? parseFloat(newEntryData.value.sleep) : null,
        mood: newEntryData.value.mood ? parseInt(newEntryData.value.mood) : null,
        activity: newEntryData.value.activity ? parseInt(newEntryData.value.activity) : null,
        nutrition: newEntryData.value.nutrition || null,
        updatedAt: new Date().toISOString()
      }
      await healthService.saveUserEntry(currentUser.value.username, entry)
      await loadUserData()
      closeModal()
    }

    const newEntry = () => {
      showEntryModal.value = true
      newEntryData.value = { sleep: '', mood: '', activity: '', nutrition: '' }
    }

    const closeModal = () => {
      showEntryModal.value = false
    }

    const viewCharts = () => {
      router.push('/health-charts')
    }

    const viewHistory = () => {
      router.push('/history')
    }

    const getTodayData = (type) => {
      const today = new Date().toISOString().split("T")[0]
      const todayEntry = userEntries.value.find(e => e.date === today)
      if (!todayEntry) return null
      switch (type) {
        case 'sleep': return todayEntry.sleep ? `${todayEntry.sleep}h` : null
        case 'mood': return todayEntry.mood ? `${todayEntry.mood}/10` : null
        case 'activity': return todayEntry.activity ? `${todayEntry.activity} min` : null
        case 'nutrition': return todayEntry.nutrition || null
        default: return null
      }
    }

    const recentEntries = computed(() => {
      return [...userEntries.value]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    return {
      currentUser,
      showEntryModal,
      newEntryData,
      userEntries,
      newEntry,
      closeModal,
      saveEntry,
      recentEntries,
      getTodayData,
      viewCharts,
      viewHistory,
      formatDate
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.top-actions {
  margin-bottom: 20px;
}

.action-buttons-top {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.user-welcome {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.welcome-section {
  text-align: center;
  padding: 40px 20px;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.feature-card .emoji {
  font-size: 2rem;
  margin-bottom: 10px;
}

.dashboard {
  margin-top: 30px;
}

.today-summary h3, .recent-entries h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.entry-item.highlight {
  background: #f0f9ff;
  border-left: 4px solid #42b983;
  padding: 15px;
  margin-bottom: 10px;
}

.view-all {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  padding: 5px 0;
  font-size: 0.9em;
}

.empty-state {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  color: #666;
}

/* Styles du modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button[type="button"] {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.modal-buttons button[type="submit"] {
  background: #42b983;
  color: white;
  border: none;
}
</style>