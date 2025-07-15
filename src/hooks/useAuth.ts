import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email?: string
  name?: string
  phone?: string
  role?: string
  user_metadata?: any
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string, userData: { name: string; phone: string }) => {
    try {
      // Simple frontend-only registration
      const newUser = {
        id: Date.now().toString(),
        email,
        name: userData.name,
        phone: userData.phone,
        role: 'patient',
        user_metadata: {
          name: userData.name,
          phone: userData.phone
        }
      }

      // Store user data in localStorage (for demo purposes)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      localStorage.setItem(`user_${email}`, JSON.stringify({ ...newUser, password }))
      
      setUser(newUser)

      toast({
        title: "Registration Successful",
        description: "Welcome! You have been registered successfully.",
      })

      return { success: true, data: { user: newUser } }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem(`user_${email}`)
      
      if (!storedUser) {
        toast({
          title: "Login Failed",
          description: "User not found. Please register first.",
          variant: "destructive",
        })
        return { success: false, error: new Error("User not found") }
      }

      const userData = JSON.parse(storedUser)
      
      if (userData.password !== password) {
        toast({
          title: "Login Failed",
          description: "Invalid password.",
          variant: "destructive",
        })
        return { success: false, error: new Error("Invalid password") }
      }

      // Set current user
      const { password: _, ...userWithoutPassword } = userData
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      return { success: true, data: { user: userWithoutPassword } }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error }
    }
  }

  const signOut = async () => {
    try {
      // Clear user data from localStorage
      localStorage.removeItem('currentUser')
      setUser(null)

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      })

      return { success: true }
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error }
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }
}