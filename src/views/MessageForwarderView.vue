<template>
  <section class="telebot-view">
    <h1 class="text-h4 mb-10">Message Forwarder</h1>
    <div class="telebot-view__list">
      <MessageForward
        v-for="(forward, index) in forwards"
        :key="'message-forward-' + (forward.id || forward.uniqueKey)"
        :forward-id="forward.id"
        :from-chat="forward.from_chat"
        :to-chats="forward.to_chats"
        @delete="deleteForwardRow(index)"
        @upsert="(item) => updateForwardRow(index, item)"
      />
      <v-btn
        color="light-blue-darken-2"
        icon="mdi-plus"
        position="fixed"
        size="large"
        variant="elevated"
        @click="addForwardItem"
      />
    </div>
  </section>
</template>

<script setup>
import { useGetMessageForwardsQuery } from '@/queries/message-forwarder.query'
import MessageForward from '@/components/MessageForward.vue'
import { onBeforeMount, ref } from 'vue'

const forwards = ref([])

const { data: messageForwards, suspense: suspenseMessageForwards } = useGetMessageForwardsQuery()

const addForwardItem = () => {
  forwards.value.push({ uniqueKey: Date.now() })
}

onBeforeMount(async () => {
  await suspenseMessageForwards()
  if (messageForwards.value?.results?.length) {
    forwards.value = [...messageForwards.value.results]
  } else {
    addForwardItem()
  }
})

const deleteForwardRow = async (index) => {
  forwards.value.splice(index, 1)
}

const updateForwardRow = async (index, item) => {
  forwards.value.splice(index, 1, item)
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/views/default';
</style>
