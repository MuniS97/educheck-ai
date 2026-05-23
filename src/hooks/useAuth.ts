import { useEffect } from 'react'
import { subscribeToAuth } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])
}
