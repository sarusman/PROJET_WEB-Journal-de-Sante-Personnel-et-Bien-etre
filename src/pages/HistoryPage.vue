<template>
  <div class="history-page">
    <header class="header">
      <h1>Historique Complet</h1>
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
import { useHistoryPage } from '../lib/HistoryPageScript.js'

export default {
  name: 'HistoryPage',
  setup() {
    return useHistoryPage()
  }
}
</script>
<style scoped>
  @import '@/assets/CSS/HistoryPage.css';
</style>