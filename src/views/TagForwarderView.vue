<template>
  <section class="telebot-view">
    <h1 class="text-h4 mb-10">Tag Forwarder</h1>
    <div class="telebot-view__list">
      <TagForwardRow
        v-for="(forward, index) in forwards"
        :key="'tag-forward-' + (forward.id || forward.uniqueKey)"
        :forward-id="forward.id"
        :tag="forward.tag"
        :to-chats="forward.to_chats"
        :allowed-users="forward.allowed_users"
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
import { useGetTagForwardsQuery } from '@/queries/tag-forwarder.query'
import TagForwardRow from '@/components/TagForwardRow.vue'
import { onBeforeMount, ref } from 'vue'

const forwards = ref([])

const { data: tagForwards, suspense: suspenseTagForwards } = useGetTagForwardsQuery()

const addForwardItem = () => {
  forwards.value.push({ uniqueKey: Date.now() })
}

onBeforeMount(async () => {
  await suspenseTagForwards()
  if (tagForwards.value?.results?.length) {
    forwards.value = [...tagForwards.value.results]
  } else {
    addForwardItem()
  }
})

const deleteForwardRow = (index) => {
  forwards.value.splice(index, 1)
}

const updateForwardRow = (index, item) => {
  forwards.value.splice(index, 1, item)
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/views/default';
</style>
