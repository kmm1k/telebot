<template>
  <section class="telebot-view">
    <h1 class="text-h4 mb-10">Bot Chats</h1>
    <div class="telebot-view__list">
      <span
          v-for="(chat, _) in chats"
          :key="'chat-' + (chat.id || chat.uniqueKey)"
          class="telebot-view__list-item">
        <v-card>
          <v-card-title>
            <h2 class="text-h5">{{ chat.chat_id }}</h2>
          </v-card-title>
          <v-card-text>
            <p>{{ chat.name }}</p>
          </v-card-text>
        </v-card>
      </span>
    </div>
  </section>
</template>

<script setup>
import {useGetBotChatsQuery} from '@/queries/bot-chats.query'
import {onBeforeMount, ref} from 'vue'

const chats = ref([])

const {data: botChats, suspense: suspenseBotChats} = useGetBotChatsQuery()

const addTagGroupRow = () => {
  chats.value.push({uniqueKey: Date.now()})
}

onBeforeMount(async () => {
  await suspenseBotChats()
  if (botChats.value?.results?.length) {
    chats.value = [...botChats.value.results]
  } else {
    addTagGroupRow()
  }
})

</script>

<style lang="scss" scoped>
@import '@/assets/scss/views/default';
</style>
