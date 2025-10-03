// File: client/src/hooks/useAuthGuard.js
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export const useAuthGuard = (requireAdmin = false) => {
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth?type=login')
    } else if (requireAdmin && currentUser.role !== 'admin') {
      navigate('/')
    }
  }, [currentUser, requireAdmin, navigate])

  return { currentUser, isAuthenticated: !!currentUser }
}
