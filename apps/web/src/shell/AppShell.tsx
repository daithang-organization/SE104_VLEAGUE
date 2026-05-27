import {
  BulbFilled,
  BulbOutlined,
  GlobalOutlined,
  KeyOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  message,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from '../components/NotificationBell';
import TeamInvitationPopup from '../components/TeamInvitationPopup';
import { apiGlobalSearch, type SearchResult } from '../services/searchApi';
import { useTheme } from './ThemeContext';
import { MENU } from './menu';
import dashboardIcon from '../assets/menu-icons/dashboard_icon.png';
import seasonIcon from '../assets/menu-icons/season_icon.png';
import teamIcon from '../assets/menu-icons/team_icon.png';
import stadiumIcon from '../assets/menu-icons/stadium_icon.png';
import playerIcon from '../assets/menu-icons/player_icon.png';
import calendarIcon from '../assets/menu-icons/calendar_icon.png';
import resultIcon from '../assets/menu-icons/result_icon.png';
import rankIcon from '../assets/menu-icons/rank_icon.png';
import headToHeadIcon from '../assets/menu-icons/1v1_icon.png';
import reportIcon from '../assets/menu-icons/report_icon.png';
import rulesIcon from '../assets/menu-icons/rules_icon.png';
import roleIcon from '../assets/menu-icons/role_icon.png';

const { Sider, Header, Content } = Layout;

const menuIconByKey: Record<string, string> = {
  dashboard: dashboardIcon,
  seasons: seasonIcon,
  teams: teamIcon,
  stadiums: stadiumIcon,
  players: playerIcon,
  schedule: calendarIcon,
  matches: resultIcon,
  standings: rankIcon,
  'head-to-head': headToHeadIcon,
  reports: reportIcon,
  regulations: rulesIcon,
  users: roleIcon,
};

function MenuIcon({ src }: { src: string }) {
  return (
    <span
      className="sidebar-menu-icon"
      aria-hidden="true"
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
  };

  // ── Global Search ──
  const [searchOptions, setSearchOptions] = useState<
    { value: string; label: React.ReactNode; result: SearchResult }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value || value.length < 2) {
      setSearchOptions([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await apiGlobalSearch(value, 8);
        setSearchOptions(
          results.map((r) => ({
            value: r.id,
            label: (
              <Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  [{r.type}]
                </Typography.Text>
                <span>{r.title}</span>
                {r.subtitle && <Typography.Text type="secondary">{r.subtitle}</Typography.Text>}
              </Space>
            ),
            result: r,
          })),
        );
      } catch (_err) {
        /* silent */
      }
      setSearchLoading(false);
    }, 300);
  };

  const onSelectSearch = (_: string, option: (typeof searchOptions)[number]) => {
    if (option.result.url) nav(option.result.url);
  };

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const role = user?.role;
    return MENU.filter((m) => !m.roles || (role && m.roles.includes(role))).map((m) => ({
      key: m.key,
      icon: menuIconByKey[m.key] ? <MenuIcon src={menuIconByKey[m.key]} /> : undefined,
      label: t(m.labelKey),
    }));
  }, [user, t]);

  // Find current selected key based on path
  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    const matchedItem = MENU.find(
      (m) => currentPath === m.path || (m.path !== '/' && currentPath.startsWith(m.path)),
    );
    return matchedItem?.key || 'dashboard';
  }, [location.pathname]);

  const onMenuClick = (e: { key: string }) => {
    const menuItem = MENU.find((m) => m.key === e.key);
    if (menuItem) {
      nav(menuItem.path);
    }
  };

  const onLogout = async () => {
    await logout();
    message.info(t('auth.loggedOut'));
    nav('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('auth.profile'),
      onClick: () => nav('/profile'),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: t('auth.changePassword'),
      onClick: () => nav('/change-password'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: `1px solid var(--sidebar-border)`,
        }}
      >
        <div
          style={{
            padding: 16,
            color: 'var(--text-main)',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          <img
            src="/V.League_1_2025-26_logo.svg.png"
            alt="VLeague Logo"
            style={{ height: '50px', objectFit: 'contain' }}
          />
        </div>
        <style>{`
          .sidebar-menu-icon {
            width: 22px;
            height: 22px;
            display: inline-block;
            vertical-align: middle;
            background: currentColor;
            opacity: 0.92;
          }

          .ant-layout-sider:not(.ant-layout-sider-collapsed) .sidebar-menu-icon {
            margin-inline-end: 12px;
          }

          .ant-layout-sider-collapsed .sidebar-menu-icon {
            width: 30px;
            height: 30px;
          }
        `}</style>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
        />
      </Sider>

      {/* Xóa màu cứng ở Layout con này để nó ăn màu cấu hình tổng */}
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '40px', // Giả sử ông muốn hẹp hẳn xuống 48px
            lineHeight: '40px', // QUAN TRỌNG: Phải khớp với height để không bị khuyết
            padding: '0 24px',
            background: 'transparent',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Global Search */}
          <AutoComplete
            className="global-search"
            options={searchOptions}
            onSearch={onSearch}
            onSelect={onSelectSearch}
            style={{
              flex: '0 1 280px', // Cho phép co lại nhưng không vượt quá 280px
              //marginRight: 'auto', // Đẩy các icon sang bên phải nếu muốn ô tìm kiếm nằm trái
              marginLeft: 16,
            }}
            allowClear
          >
            <Input
              className="global-search-input"
              size="small" // Dùng size nhỏ để khớp với navbar hẹp
              prefix={searchLoading ? <Spin size="small" /> : <SearchOutlined />}
              placeholder={t('common.search')}
            />
          </AutoComplete>

          {/* Dark Mode Toggle */}
          <Button
            type="text"
            icon={
              isDark ? (
                <BulbFilled style={{ color: '#fadb14' }} />
              ) : (
                <BulbOutlined style={{ color: 'var(--text-main)' }} />
              )
            }
            onClick={toggleTheme}
            title={isDark ? t('theme.light') : t('theme.dark')}
          />

          {/* Language Toggle */}
          <Button
            type="text"
            icon={<GlobalOutlined style={{ color: 'var(--text-main)' }} />}
            onClick={toggleLang}
            title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <span style={{ color: 'var(--text-main)', fontSize: 12, marginLeft: 4 }}>
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </span>
          </Button>

          {/* Notification Bell */}
          <NotificationBell />

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Button type="text" style={{ color: 'var(--text-main)' }}>
              <Space>
                <UserOutlined />
                {user?.email}
              </Space>
            </Button>
          </Dropdown>
        </Header>

        {/* SỬA Ở ĐÂY: Chuyển background thành transparent để nhìn xuyên thấu xuống màu xanh Navy */}
        <Content style={{ padding: 24, background: 'transparent', minHeight: 0 }}>
          {/* 1. ĐỊNH NGHĨA HIỆU ỨNG FADE-IN & SLIDE-UP */}
          <style>{`
            @keyframes pageTransition {
              from {
                opacity: 0;
                transform: translateY(15px); /* Trượt nhẹ từ dưới lên 15px */
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .page-animate {
              animation: pageTransition 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
              height: 100%;
            }
          `}</style>

          {/* 2. BỌC OUTLET VÀ GẮN KEY LOCATION */}
          <div key={location.pathname} className="page-animate">
            <Outlet />
          </div>
          <TeamInvitationPopup />
        </Content>
      </Layout>
    </Layout>
  );
}
