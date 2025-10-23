import { supabase } from './supabase'

export type UserRole = 'admin' | 'socio' | 'guest'

export interface User {
  id: string
  email: string
  role: UserRole
  metadata?: Record<string, unknown>
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user role from user metadata or database
    const role = (user.user_metadata?.role as UserRole) || 'guest'

    return {
      id: user.id,
      email: user.email || '',
      role,
      metadata: user.user_metadata
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if user is socio (member)
 */
export function isSocio(user: User | null): boolean {
  return hasRole(user, 'socio')
}

/**
 * Check if user can manage socios (members)
 */
export function canManageSocios(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage cuotas (fees)
 */
export function canManageCuotas(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage pagos (payments)
 */
export function canManagePagos(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage habilitaciones (authorizations)
 */
export function canManageHabilitaciones(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can view their own data
 */
export function canViewOwnData(user: User | null, targetUserId: string): boolean {
  if (!user) return false
  return user.id === targetUserId || isAdmin(user)
}
