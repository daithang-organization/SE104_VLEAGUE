import {
  BarChartOutlined,
  CalendarOutlined,
  HomeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

import headToHeadIcon from '../assets/menu-icons/1v1_icon.png';
import matchIcon from '../assets/menu-icons/match_icon.png';
import playerIcon from '../assets/menu-icons/player_icon.png';
import roleIcon from '../assets/menu-icons/role_icon.png';
import rulesIcon from '../assets/menu-icons/rules_icon.png';
import seasonIcon from '../assets/menu-icons/season_icon.png';
import stadiumIcon from '../assets/menu-icons/stadium_icon.png';
import teamIcon from '../assets/menu-icons/team_icon.png';

type AppMenuIconVariant = 'sidebar' | 'cover';

type AppMenuIconProps = {
  menuKey: string;
  variant?: AppMenuIconVariant;
};

const maskIconByKey: Record<string, string> = {
  seasons: seasonIcon,
  matches: matchIcon,
  teams: teamIcon,
  stadiums: stadiumIcon,
  players: playerIcon,
  'head-to-head': headToHeadIcon,
  regulations: rulesIcon,
  users: roleIcon,
};

function getIconClassName(variant: AppMenuIconVariant) {
  return variant === 'sidebar' ? 'sidebar-menu-ant-icon' : 'page-cover-ant-icon';
}

function getMaskClassName(variant: AppMenuIconVariant) {
  return variant === 'sidebar' ? 'sidebar-menu-icon' : 'page-cover-mask-icon';
}

export function AppMenuIcon({ menuKey, variant = 'cover' }: AppMenuIconProps) {
  const iconClassName = getIconClassName(variant);

  switch (menuKey) {
    case 'dashboard':
      return <HomeOutlined className={iconClassName} />;
    case 'schedule':
      return <CalendarOutlined className={iconClassName} />;
    case 'standings':
      return <TrophyOutlined className={iconClassName} />;
    case 'reports':
      return <BarChartOutlined className={iconClassName} />;
    default: {
      const src = maskIconByKey[menuKey];
      if (!src) return null;

      const maskClassName = getMaskClassName(variant);

      return (
        <span
          className={`${maskClassName} ${maskClassName}-${menuKey}`}
          aria-hidden="true"
          style={{
            WebkitMask: `url(${src}) center / contain no-repeat`,
            mask: `url(${src}) center / contain no-repeat`,
          }}
        />
      );
    }
  }
}

export default AppMenuIcon;
