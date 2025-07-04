import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { HealthJournalService } from './HealthJournalService.js'
import { useRouter } from 'vue-router'

export function useHomePage() {
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
      const entries = await healthService.getUserEntries(currentUser.value.username)
      userEntries.value = entries.sort((a, b) => new Date(b.date) - new Date(a.date))
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
    userEntries.value.unshift(entry)
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
    return userEntries.value.slice(0, 5)
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
