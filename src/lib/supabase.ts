// Simple mock client for frontend-only functionality
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: (credentials: any) => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: (credentials: any) => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    insert: () => Promise.resolve({ error: null }),
    select: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ error: null }),
    delete: () => Promise.resolve({ error: null })
  })
}

// Database types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'patient' | 'admin' | 'diagnostic_center_admin' | 'super_admin'
  created_at: string
  updated_at: string
}

export interface DiagnosticCenter {
  id: string
  name: string
  address: string
  phone: string
  email: string
  description?: string
  created_at: string
  updated_at: string
}

export interface DiagnosticTest {
  id: string
  name: string
  description?: string
  price: number
  category: string
  duration: string
  center_id: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  diagnostic_center_id: string
  test_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  total_amount: number
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
}