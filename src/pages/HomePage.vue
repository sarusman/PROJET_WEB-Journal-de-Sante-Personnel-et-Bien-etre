<template>
  <div class="page-container">
    <header class="header">
      <nav class="nav-bar">
        <div class="nav-left">
          <h1 class="app-title">Journal Santé</h1>
        </div>
        <div class="nav-center">
          <BaseButton><a href="#" class="nav-link active">Home</a></BaseButton>
          <BaseButton><a href="#" class="nav-link">Conversations</a></BaseButton>
          <BaseButton><a href="#" class="nav-link">About</a></BaseButton>
        </div>
        <div class="nav-right">
          <SignInButton />
        </div>
      </nav>
    </header>

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
            Aucune activité enregistrée. Dans le cas contraire, rafraichissez la page.
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
            <button @click="$router.push('/history')" class="view-all">
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
import BaseButton from '../components/BaseButton.vue'
import SignInButton from '../components/SignInButton.vue'
import AsyncButton from '../components/AsyncButton.vue'
import '../assets/HomePage.css'
import { HealthJournalService } from '../lib/HealthJournalService.js'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  components: { BaseButton, SignInButton, AsyncButton },
  setup() {
    const store = useStore()
    const currentUser = computed(() => store.state.user)
    const router = useRouter()
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

