export const USER_ROLES = ['viewer', 'analyst', 'admin'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['active', 'inactive'] as const

export type UserStatus = (typeof USER_STATUSES)[number]
