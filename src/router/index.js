import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import MessageForwarderView from '@/views/MessageForwarderView.vue'
import AuthorizedLayout from '@/layouts/AuthorizedLayout.vue'
import TagGrouperView from '@/views/TagGrouperView.vue'
import LoginView from '@/views/LoginView.vue'
import TagForwarderView from '@/views/TagForwarderView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import BotChatsView from "@/views/BotChatsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: isLoggedOut,
    },
    {
      path: '/',
      meta: { layout: AuthorizedLayout },
      beforeEnter: isLoggedIn,
      children: [
        {
          path: '',
          name: 'messageForwarder',
          component: MessageForwarderView,
        },
        {
          path: 'tag-grouper',
          name: 'tagGrouper',
          component: TagGrouperView,
        },
        {
          path: 'tag-forwarder',
          name: 'tagForwarder',
          component: TagForwarderView,
        },
        {
          path: 'bot-chats',
          name: 'botChats',
          component: BotChatsView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router

function isLoggedOut() {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    return { path: '/' }
  }
}

function isLoggedIn(to) {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return {
      path: '/login',
      query: {
        next: to.path,
      },
    }
  }
}
