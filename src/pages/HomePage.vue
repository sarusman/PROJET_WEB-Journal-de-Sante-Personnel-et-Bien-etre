<template>
  <div class="page-container">
    <div v-if="currentUser" class="top-actions">
      <div class="action-buttons-top">
        <AsyncButton color="primary" @click="newEntry">📝 Nouvelle entrée</AsyncButton>
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
        <div class="lifestyle-suggestion">
          <h4>💡 Suggestion bien-être</h4>
          <p>{{ suggestion || 'Chargement...' }}</p>
        </div>

        <div class="recent-entries">
          <h3>Dernier Enregistrement</h3>
          <div v-if="recentEntries.length === 0" class="empty-state">
            Aucun enregistrement.
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
import { useHomePage } from '../lib/HomePageScript.js'
import AsyncButton from '../components/AsyncButton.vue'

export default {
  name: 'HomePage',
  components: { AsyncButton },
  setup() {
    return useHomePage()
  }
}
</script>

<style scoped>
  @import '@/assets/CSS/HomePage.css';
</style>
