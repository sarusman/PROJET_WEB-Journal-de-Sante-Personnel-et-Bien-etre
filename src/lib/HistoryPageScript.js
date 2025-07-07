import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { HealthJournalService } from '../lib/HealthJournalService.js'

export function useHistoryPage() {
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

    if (timeRange.value !== 'all') {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange.value))
      entries = entries.filter(e => new Date(e.date) >= cutoffDate)
    }

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
    editingEntry.value = JSON.parse(JSON.stringify(entry))
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
  }

  const saveEditedEntry = async () => {
    try {
      if (editingEntry.value.id) {
        await healthService.updateUserEntry(store.state.user.username, editingEntry.value)
      } else {
        await healthService.saveUserEntry(store.state.user.username, editingEntry.value)
      }
      await loadEntries()
      closeEditModal()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error)
      alert("Erreur lors de la sauvegarde: " + error.message)
    }
  }

  const deleteEntry = async () => {
    if (confirm("Voulez-vous vraiment supprimer cette entrée ?")) {
      try {
        await healthService.deleteUserEntry(store.state.user.username, editingEntry.value)
        await loadEntries()
        closeEditModal()
      } catch (error) {
        console.error("Erreur lors de la suppression", error)
        alert("Erreur lors de la suppression: " + error.message)
      }
    }
  }

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
