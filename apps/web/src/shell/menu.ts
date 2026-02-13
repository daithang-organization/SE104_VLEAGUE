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
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE'],
  },
  {
    key: 'teams',
    label: 'Đội bóng',
    path: '/teams',
    roles: ['ADMIN', 'TEAM_MANAGER'],
  },
  {
    key: 'players',
    label: 'Cầu thủ',
    path: '/players',
    roles: ['ADMIN', 'TEAM_MANAGER'],
  },
  {
    key: 'schedule',
    label: 'Lịch thi đấu',
    path: '/schedule',
    roles: ['ADMIN'],
  },
  {
    key: 'matches',
    label: 'Kết quả trận đấu',
    path: '/matches',
    roles: ['ADMIN', 'REFEREE'],
  },
  {
    key: 'standings',
    label: 'Bảng xếp hạng',
    path: '/standings',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE'],
  },
  {
    key: 'users',
    label: 'Quản lý người dùng',
    path: '/users',
    roles: ['ADMIN'],
  },
  {
    key: 'reports',
    label: 'Báo cáo',
    path: '/reports',
    roles: ['ADMIN'],
  },
];
