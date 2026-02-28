export type MenuItem = {
  key: string;
  /** Translation key for the label (e.g. 'menu.dashboard') */
  labelKey: string;
  path: string;
  /** Roles that can see this menu item. If undefined, all authenticated users can see it. */
  roles?: string[];
};

export const MENU: MenuItem[] = [
  {
    key: 'dashboard',
    labelKey: 'menu.dashboard',
    path: '/',
  },
  {
    key: 'seasons',
    labelKey: 'menu.seasons',
    path: '/seasons',
    roles: ['ADMIN'],
  },
  {
    key: 'teams',
    labelKey: 'menu.teams',
    path: '/teams',
    roles: ['ADMIN', 'TEAM_MANAGER', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'stadiums',
    labelKey: 'menu.stadiums',
    path: '/stadiums',
    roles: ['ADMIN'],
  },
  {
    key: 'players',
    labelKey: 'menu.players',
    path: '/players',
    roles: ['ADMIN', 'TEAM_MANAGER', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'schedule',
    labelKey: 'menu.schedule',
    path: '/schedule',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'matches',
    labelKey: 'menu.matches',
    path: '/matches',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'],
  },
  {
    key: 'standings',
    labelKey: 'menu.standings',
    path: '/standings',
  },
  {
    key: 'head-to-head',
    labelKey: 'menu.headToHead',
    path: '/head-to-head',
  },
  {
    key: 'reports',
    labelKey: 'menu.reports',
    path: '/reports',
  },
  {
    key: 'regulations',
    labelKey: 'menu.regulations',
    path: '/regulations',
    roles: ['ADMIN'],
  },
  {
    key: 'users',
    labelKey: 'menu.users',
    path: '/users',
    roles: ['ADMIN'],
  },
];
