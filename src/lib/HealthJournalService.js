export class HealthJournalService {
  constructor(apiBase = "https://webprojetsaru.pythonanywhere.com") {
    this.api = apiBase
  }

  async getUserEntries(email) {
    try {
      const res = await fetch(`${this.api}/entries/${email}`)
      const entries = await res.json()
      return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (e) {
      console.error("API get error", e)
      return []
    }
  }

  async saveUserEntry(email, entry) {
    try {
      const response = await fetch(`${this.api}/entries/${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      })
      return await response.json()
    } catch (e) {
      console.error("API save error", e)
      throw e
    }
  }

  async updateUserEntry(email, entry) {
    try {
      if (!entry.id) {
        throw new Error("Entry ID is required for update");
      }
      
      const response = await fetch(`${this.api}/entries/${email}/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) throw new Error("Update failed");
      return await response.json();
    } catch (e) {
      console.error("API update error", e);
      throw e;
    }
  }

  async deleteUserEntry(email, entry) {
    try {
      const entryId = entry.id || (entry._id && entry._id.$oid) || entry._id;
      if (!entryId) {
        throw new Error("Impossible de trouver l'ID de l'entrée à supprimer");
      }

      const response = await fetch(`${this.api}/entries/${email}/${entryId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la suppression");
      }
      
      return await response.json();
    } catch (e) {
      console.error("Erreur API delete:", e);
      throw new Error(`Erreur lors de la suppression: ${e.message}`);
    }
  }

  // stats
  async getUserStats(email, days = 30) {
    const entries = await this.getUserEntries(email)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    const filtered = entries.filter(e => {
      return e.date >= start.toISOString().split("T")[0] && e.date <= end.toISOString().split("T")[0]
    })

    if (filtered.length === 0)
      return { totalEntries: 0, avgSleep: 0, avgMood: 0, avgActivity: 0, period: days }

    const avg = (arr, key) =>
      arr.length ? arr.reduce((s, e) => s + (e[key] || 0), 0) / arr.length : 0

    const sleep = filtered.filter(e => e.sleep != null)
    const mood = filtered.filter(e => e.mood != null)
    const activity = filtered.filter(e => e.activity != null)

    return {
      totalEntries: filtered.length,
      avgSleep: Math.round(avg(sleep, 'sleep') * 10) / 10,
      avgMood: Math.round(avg(mood, 'mood') * 10) / 10,
      avgActivity: Math.round(avg(activity, 'activity')),
      period: days
    }
  }

  // today
  async getTodayEntry(email) {
    const entries = await this.getUserEntries(email)
    const today = new Date().toISOString().split("T")[0]
    return entries.find(e => e.date === today) || null
  }

  // reuse: get chart data
  async getChartData(email, days = 30) {
    const entries = await this.getUserEntries(email)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    const filtered = entries.filter(e => {
      return e.date >= start.toISOString().split("T")[0] && e.date <= end.toISOString().split("T")[0]
    }).sort((a,b) => new Date(a.date) - new Date(b.date))

    const timeSeries = filtered.map(e => ({
      date: e.date,
      dateFormatted: new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      sleep: e.sleep || 0,
      mood: e.mood || 0,
      activity: e.activity || 0
    }))

    const correlation = filtered.filter(e => e.activity != null && e.mood != null)
      .map(e => ({ activity: e.activity, mood: e.mood, date: e.date }))

    return { timeSeries, correlation }
  }

  calculateCorrelation(data) {
    if (data.length < 2) return 0
    const n = data.length
    const sumX = data.reduce((s, i) => s + i.x, 0)
    const sumY = data.reduce((s, i) => s + i.y, 0)
    const sumXY = data.reduce((s, i) => s + i.x * i.y, 0)
    const sumX2 = data.reduce((s, i) => s + i.x ** 2, 0)
    const sumY2 = data.reduce((s, i) => s + i.y ** 2, 0)
    const num = n * sumXY - sumX * sumY
    const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
    return den === 0 ? 0 : num / den
  }

  async generateHealthReport(email, days = 30) {
    const stats = await this.getUserStats(email, days)
    const chart = await this.getChartData(email, days)
    const corr = this.calculateCorrelation(chart.correlation.map(i => ({ x: i.activity, y: i.mood })))
    const recent = chart.timeSeries.slice(-7)
    const older = chart.timeSeries.slice(-14, -7)

    const trends = {
      sleep: this.trend(older, recent, 'sleep'),
      mood: this.trend(older, recent, 'mood'),
      activity: this.trend(older, recent, 'activity')
    }

    return {
      period: days,
      statistics: stats,
      trends,
      correlations: { activityMood: Math.round(corr * 100) / 100 },
      recommendations: this.recommend(stats, trends, corr)
    }
  }

  trend(old, recent, field) {
    const avg = arr => arr.length ? arr.reduce((s, i) => s + (i[field] || 0), 0) / arr.length : 0
    const o = avg(old)
    const r = avg(recent)
    const change = r - o
    const pct = o > 0 ? (change / o) * 100 : 0
    return {
      oldAverage: Math.round(o * 10) / 10,
      newAverage: Math.round(r * 10) / 10,
      change: Math.round(change * 10) / 10,
      percentChange: Math.round(pct * 10) / 10,
      direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
    }
  }

  recommend(stats, trends, corr) {
    const rec = []
    if (stats.avgSleep < 7) rec.push({ category: 'Sommeil', message: 'Dormez plus', priority: 'high' })
    if (stats.avgMood < 5) rec.push({ category: 'Humeur', message: 'Humeur basse', priority: 'high' })
    if (stats.avgActivity < 30) rec.push({ category: 'Activité', message: 'Bougez plus', priority: 'medium' })
    if (corr > 0.5) rec.push({ category: 'Corrélation', message: 'Bonne corrélation activité/humeur', priority: 'low' })
    return rec
  }
}
