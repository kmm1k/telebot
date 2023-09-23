import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'

export function useGetBotChatsQuery() {
  return useQuery({
    queryKey: ['bot-chats'],
    queryFn: async () => {
      const { data } = await axios.get('/api/botchats/')
      return data
    },
  })
}
