export type MenuItem = {
  key: string;
  label: string;
  path: string;
  /** Roles that can see this menu item. If undefined, all authenticated users can see it. */
  roles?: string[];
};

export const MENU: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
  },
  {
    key: 'seasons',
    label: 'Mùa giải',
    path: '/seasons',
    roles: ['ADMIN'],
  },
  {
    key: 'teams',
    label: 'Đội bóng',
    path: '/teams',
    roles: ['ADMIN', 'TEAM_MANAGER', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'players',
    label: 'Cầu thủ',
    path: '/players',
    roles: ['ADMIN', 'TEAM_MANAGER', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'schedule',
    label: 'Lịch thi đấu',
    path: '/schedule',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'matches',
    label: 'Kết quả trận đấu',
    path: '/matches',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'standings',
    label: 'Bảng xếp hạng',
    path: '/standings',
  },
  {
    key: 'reports',
    label: 'Báo cáo',
    path: '/reports',
  },
  {
    key: 'regulations',
    label: 'Quy định',
    path: '/regulations',
    roles: ['ADMIN'],
  },
  {
    key: 'users',
    label: 'Quản lý người dùng',
    path: '/users',
    roles: ['ADMIN'],
  },
];
