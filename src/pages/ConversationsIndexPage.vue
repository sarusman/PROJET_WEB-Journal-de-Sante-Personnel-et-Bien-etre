<template>
  <div class="conversations-index">
    <div class="header">
      <span>Number of conversations to display :</span>
      <select class="number-select">
        <option value="10" selected>10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
    
    <h2>Your last 10 mails of 'Thu Feb 08 2024 20:20:59 GMT+0100 (heure normale d'Europe centrale)' :</h2>
    
    <div class="email-table">
      <div class="table-header">
        <div class="col-subject">Subject</div>
        <div class="col-sender">From/Sender</div>
        <div class="col-preview">Message Preview</div>
        <div class="col-datetime">Date Time</div>
      </div>
      
      <router-link
        v-for="email in emails"
        :key="email.id"
        :to="`/conversations/${email.id}`"
        class="email-row"
      >
        <div class="col-subject">{{ email.subject }}</div>
        <div class="col-sender">{{ email.sender }}</div>
        <div class="col-preview">{{ email.preview }}</div>
        <div class="col-datetime">{{ email.datetime }}</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import emailsData from './data_conversation.json'

export default {
  name: 'ConversationsIndexPage',
  data() {
    return {
      emails: emailsData
    }
  }
}
</script>

<style scoped>
.conversations-index {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 14px;
}

.number-select {
  padding: 2px 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: white;
}

h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.email-table {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 3fr 1fr;
  background-color: #d32f2f;
  color: white;
  font-weight: bold;
  padding: 12px 0;
}

.table-header > div {
  padding: 0 10px;
  text-align: center;
}

.email-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 3fr 1fr;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  background-color: white;
  text-decoration: none;
  color: inherit;
}

.email-row:nth-child(even) {
  background-color: #f9f9f9;
}

.email-row:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.email-row > div {
  padding: 0 10px;
  font-size: 13px;
  line-height: 1.4;
}

.col-subject {
  font-weight: 500;
  color: #333;
}

.col-sender,
.col-preview,
.col-datetime {
  color: #666;
}

.col-datetime {
  font-size: 12px;
  text-align: right;
}
</style>
