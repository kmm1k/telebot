<template>
  <v-layout class="authorized-layout">
    <v-app-bar theme="dark" :elevation="0" density="compact">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" theme="dark">
      <v-list nav>
        <v-list-item exact title="Message Forwarder" to="/" />
        <v-list-item title="Tag Grouper" to="/tag-grouper" />
        <v-list-item title="Tag Forwarder" to="/tag-forwarder" />
        <v-list-item title="Bot Chats" to="/bot-chats" />
        <v-list-item title="Log out" append-icon="mdi-logout" @click="authStore.logout()" />
      </v-list>
    </v-navigation-drawer>
    <v-main class="authorized-layout__main">
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const drawer = ref(false)
const authStore = useAuthStore()
</script>

<style lang="scss" scoped>
.authorized-layout {
  padding: 32px;
  width: 100vw;
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__main {
    width: 1200px;
    max-width: 100%;
    flex: 1;
  }

  .v-navigation-drawer,
  .v-app-bar {
    position: fixed !important;
  }
}
</style>
