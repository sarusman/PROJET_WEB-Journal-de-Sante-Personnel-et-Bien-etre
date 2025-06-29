<template>
  <div class="conversation-show">
    <h2>Détails de la conversation</h2>

    <div v-if="conversation">
      <p><strong>ID:</strong> {{ conversation.id }}</p>
      <p><strong>Subject:</strong> {{ conversation.subject }}</p>
      <p><strong>Sender:</strong> {{ conversation.sender }}</p>
      <p><strong>Preview:</strong> {{ conversation.preview }}</p>
      <p><strong>DateTime:</strong> {{ conversation.datetime }}</p>
    </div>

    <div v-else>
      <p>Conversation non trouvée.</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import emailsData from './data_conversation.json'

export default {
  name: 'ConversationShowPage',
  setup() {
    const route = useRoute()
    const conversationId = computed(() => Number(route.params.id))

    const conversation = computed(() => {
      return emailsData.find(email => email.id === conversationId.value)
    })

    return {
      conversation,
      conversationId
    }
  }
}
</script>

<style scoped>
.conversation-show {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.conversation-show h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.conversation-show p {
  margin: 8px 0;
}
</style>
