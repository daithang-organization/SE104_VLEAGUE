/**
 * Enum định nghĩa các vai trò trong hệ thống
 * Source of truth cho RBAC - phải khớp với Prisma UserRole enum
 */
export enum Role {
  ADMIN = 'ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
  REFEREE = 'REFEREE',
}
